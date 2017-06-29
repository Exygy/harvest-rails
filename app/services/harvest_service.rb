# wrapper for Harvest API
class HarvestService
  def self.api
    Harvest.client(
      subdomain: 'exygy',
      username: ENV['HARVEST_USERNAME'],
      password: ENV['HARVEST_PASSWORD'],
    )
  end

  def self.all_users
    Rails.cache.fetch('all_users') do
      all = api.users.all.reject { |u| u['is_contractor'] || !u['is_active'] }
      all.collect do |u|
        { u['id'] => "#{u['first_name']} #{u['last_name']}" }
      end
    end
  end

  def self.weekly_data(week = 0)
    Rails.cache.fetch("weekly_data_#{week}", expires_in: 60.minutes) do
      all_users.collect do |user|
        weekly_time_by_user(user.keys.first, week)
      end
    end
  end

  def self.weekly_time_by_user(user_id, week = 0)
    puts "getting person for user: #{user_id}..."
    f_pers = forecast_person(user_id)
    return unless f_pers
    name = "#{f_pers.attributes['first_name']} #{f_pers.attributes['last_name']}"
    timesheets = weekly_time_by_person(f_pers, user_id, week)

    total_forecasted = timesheets.collect(&:forecasted).sum
    total_hours = timesheets.collect(&:total).sum
    {
      name: name,
      week: week,
      total_forecasted: total_forecasted.round(2),
      total_hours: total_hours.round(2),
      timesheets: timesheets,
    }
  end

  def self.weekly_time_by_person(f_pers, user_id, week = 0)
    today = Date.today + week.weeks # weeks should be negative to look back
    beginning_date = today.beginning_of_week(:monday)
    end_date = week.zero? ? today : today.end_of_week(:monday)
    puts "loading harvest logs, week: #{week} for #{name}..."

    f_pers_id = f_pers.attributes['id']
    assigned_hours = forecast_assignments_for_week(f_pers_id, beginning_date, end_date)
    times = api.reports.time_by_user(user_id, beginning_date, end_date)
    grouped = times.group_by { |time_group| time_group['project_id'] }

    logged_hours = grouped.map do |id, logs|
      puts "getting project for harvest_id #{id}..."
      f_proj = forecast_project(id)
      next unless f_proj && !f_proj.attributes['archived']
      f_proj_id = f_proj.attributes['id']
      assigned_proj_hours = assigned_hours.find { |x| x[:proj_id] == f_proj_id }
      forecasted = assigned_proj_hours ? assigned_proj_hours.forecasted : 0
      Hashie::Mash.new(
        project: f_proj.attributes['name'],
        project_id: f_proj_id,
        total: logs.collect { |x| x['hours'] }.sum.round(2),
        forecasted: forecasted,
      )
    end.compact

    assigned_hours.each do |assigned_proj|
      next unless logged_hours.select { |x| x.project_id == assigned_proj.proj_id }.empty?
      f_proj = forecast_project_by_id(assigned_proj.proj_id)
      next unless f_proj && !f_proj.attributes['archived'] && f_proj.attributes['harvest_id']
      logged = Hashie::Mash.new(
        project: f_proj.attributes['name'],
        project_id: f_proj.attributes['id'],
        total: 0,
        forecasted: assigned_proj.forecasted,
      )
      logged_hours << logged
    end

    logged_hours
  end

  def self.forecast_assignments_for_week(f_pers_id, beginning_date, end_date)
    puts "getting assignments... person_id: #{f_pers_id}"
    assignments = forecast_all_assignments_for_week(beginning_date, end_date).select do |assn|
      assn.attributes['person_id'] == f_pers_id
    end
    assignments.group_by { |x| x.attributes['project_id'] }.collect do |id, assns|
      forecasted = assns.collect do |assn|
        attrs = assn.attributes
        next unless attrs['allocation']
        hrs = attrs['allocation'] / 3600.0
        week_start = [Date.parse(attrs['start_date']), beginning_date].max
        week_end = [Date.parse(attrs['end_date']), end_date].min
        business_days = [((week_end - week_start).to_i + 1), 5].min
        hrs * business_days
      end.compact.sum
      Hashie::Mash.new(
        proj_id: id,
        forecasted: forecasted,
      )
    end
  end

  def self.forecast_all_assignments_for_week(beginning_date, end_date)
    Rails.cache.fetch "all_assignments_#{beginning_date}_#{end_date}" do
      Forecast::Assignment.all(
        start_date: beginning_date.to_s,
        end_date: end_date.to_s,
      )
    end
  end

  def self.all_forecast_projects
    Rails.cache.fetch 'all_forecast_projects' do
      Forecast::Project.all
    end
  end

  def self.all_forecast_people
    Rails.cache.fetch 'all_forecast_people' do
      Forecast::Person.all
    end
  end

  def self.forecast_project_by_id(f_id)
    all_forecast_projects.find { |p| p.attributes['id'] == f_id }
  end

  def self.forecast_project(h_id)
    all_forecast_projects.find { |p| p.attributes['harvest_id'] == h_id }
  end

  def self.forecast_person(h_id)
    all_forecast_people.find { |p| p.attributes['harvest_user_id'] == h_id }
  end
end
