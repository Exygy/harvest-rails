# wrapper for Harvest API
class HarvestService
  def self.api
    Harvest.client(
      subdomain: 'exygy',
      username: ENV['HARVEST_USERNAME'],
      password: ENV['HARVEST_PASSWORD']
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

  def self.everything(week = 0)
    all_users.collect do |user|
      weekly_time_by_user(user.keys.first, week)
    end
  end

  def self.weekly_time_by_user(user_id, week = 0)
    puts "getting person for user: #{user_id}..."
    f_pers = forecast_person(user_id)
    name = "#{f_pers.attributes['first_name']} #{f_pers.attributes['last_name']}"
    return unless f_pers
    today = Date.today + week.weeks # weeks should be negative to look back
    beginning_date = today.beginning_of_week
    end_date = week.zero? ? today : (today.end_of_week - 2.days) # turn it into Friday
    puts "loading harvest logs, week: #{week} for #{name}..."
    times = api.reports.time_by_user(user_id, beginning_date, end_date)
    grouped = times.group_by { |time_group| time_group['project_id'] }
    grouped.map do |id, t|
      puts "getting project for harvest_id #{id}..."
      f_proj = forecast_project(id)
      next unless f_proj
      assigned_hours = forecast_assignments_for_week(f_proj, f_pers, beginning_date, end_date)
      next unless assigned_hours
      {
        name: name,
        project: f_proj.attributes['name'],
        project_id: id,
        total: t.collect { |x| x['hours'] }.sum,
        forecasted: assigned_hours
      }
    end.compact
  end

  def self.forecast_assignments_for_week(f_proj, f_pers, beginning_date, end_date)
    puts "getting assignments... project_id: #{f_proj.attributes['id']}, person_id: #{f_pers.attributes['id']}"
    assignments = forecast_all_assignments_for_week(beginning_date, end_date).select do |assn|
      assn.attributes['project_id'] == f_proj.attributes['id'] &&
        assn.attributes['person_id'] == f_pers.attributes['id']
    end
    assignments.collect do |assn|
      attrs = assn.attributes
      hrs = attrs['allocation'] / 3600.0
      week_start = [Date.parse(attrs['start_date']), beginning_date].max
      week_end = [Date.parse(attrs['end_date']), end_date].min
      days = (week_end - week_start).to_i + 1
      # binding.pry
      hrs * days
    end.sum
  end

  def self.forecast_all_assignments_for_week(beginning_date, end_date)
    Rails.cache.fetch "all_assignments_#{beginning_date.to_s}_#{end_date.to_s}" do
      Forecast::Assignment.all(
        start_date: beginning_date.to_s,
        end_date: end_date.to_s
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

  def self.forecast_project(h_id)
    all_forecast_projects.find { |p| p.attributes['harvest_id'] == h_id }
  end

  def self.forecast_person(h_id)
    all_forecast_people.find { |p| p.attributes['harvest_user_id'] == h_id }
  end
end
