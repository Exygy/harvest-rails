# wrapper for Harvest API
class HarvestService
  def self.api
    Harvest.client(
      subdomain: 'exygy',
      username: ENV['HARVEST_USERNAME'],
      password: ENV['HARVEST_PASSWORD'],
    )
  end

  def self.periodic_data(date = Date.today, period = 'week')
    Rails.cache.fetch("periodic_#{period}_data_#{date}", expires_in: 15.minutes) do
      Person.all.collect do |person|
        next unless person.harvest_logs.count > 0
        time_by_person_for_period(person, date, period)
      end.compact
    end
  end

  ########

  def self.time_by_person_for_period(person, date, period = 'week')
    date = Date.parse(date) unless date.is_a?(Date)
    beginning_date = date.send("beginning_of_#{period}")
    end_date = date.send("end_of_#{period}")
    end_date = Date.today if end_date > Date.today
    aggregate_data_for_person(person, beginning_date, end_date)
  end

  def self.aggregate_data_for_person(person, beginning_date, end_date)
    timesheets = timesheets_by_person(person, beginning_date, end_date)
    total_forecasted = timesheets.collect(&:forecasted).sum.round(2)
    total_hours = timesheets.collect(&:total).sum.round(2)
    diff = (total_hours - total_forecasted).round(2)
    {
      name: person.name,
      is_contractor: person.is_contractor,
      beginning_date: beginning_date,
      end_date: end_date,
      total_forecasted: total_forecasted,
      total_hours: total_hours,
      diff: diff,
      timesheets: timesheets,
    }
  end

  def self.timesheets_by_person(person, beginning_date, end_date)
    puts "loading harvest logs: #{beginning_date} - #{end_date} for #{person.name}..."
    assigned_hours = forecast_assignments_for_range(person, beginning_date, end_date)
    logged_hours = collect_logged_hours(person, assigned_hours, beginning_date, end_date)

    # also collect forecasted projects where the person didn't log any time in harvest
    assigned_hours.each do |assigned_proj|
      next unless logged_hours.select { |x| x.project_id == assigned_proj[:project_id] }.empty?
      project = Project.where(forecast_id: assigned_proj[:project_id]).first
      next unless project && !project.is_archived
      logged = Hashie::Mash.new(
        project: project.name,
        project_id: project.forecast_id,
        total: 0,
        forecasted: assigned_proj.forecasted,
      )
      logged_hours << logged
    end

    logged_hours
  end

  def self.collect_logged_hours(person, assigned_hours, beginning_date, end_date)
    harvest_logs = person.harvest_logs.where(
      :spent_at.gte => beginning_date,
      :spent_at.lte => end_date,
    )
    grouped = harvest_logs.group_by(&:harvest_project_id)
    grouped.map do |id, logs|
      project = Project.where(harvest_id: id).first
      next unless project
      # puts "getting forecast project #{project.name}; #{id}..."
      assigned_proj_hours = assigned_hours.find { |x| x[:project_id] == project.forecast_id }
      forecasted = assigned_proj_hours ? assigned_proj_hours.forecasted : 0
      Hashie::Mash.new(
        project: project.name,
        project_id: project.forecast_id,
        total: logs.collect { |x| x['hours'] }.sum.round(2),
        forecasted: forecasted,
      )
    end.compact
  end

  def self.forecast_assignments_for_range(person, beginning_date, end_date)
    # puts "getting assignments... person_id: #{person.forecast_id}"
    assignments = ForecastAssignment.where(
      :end_date.gte => beginning_date,
      :start_date.lte => end_date,
      forecast_person_id: person.forecast_id,
    )
    assignments.group_by(&:forecast_project_id).collect do |forecast_id, assns|
      forecasted = assns.collect do |assn|
        next unless assn.allocation
        project = Project.where(forecast_id: forecast_id).first
        next unless project && project.is_billable
        hrs = assn.allocation / 3600.0
        period_start = [assn.start_date, beginning_date].max
        period_end = [assn.end_date, end_date].min
        business_days = num_of_weekdays(period_start, period_end)
        hrs * business_days
      end.compact.sum
      Hashie::Mash.new(
        project_id: forecast_id,
        forecasted: forecasted,
      )
    end
  end

  def self.all_harvest_tasks
    Rails.cache.fetch 'all_harvest_tasks' do
      api.tasks.all
    end
  end

  def self.harvest_task_by_id(h_id)
    all_harvest_tasks.find { |t| t['id'] == h_id }
  end

  def self.all_forecast_projects
    Rails.cache.fetch 'all_forecast_projects' do
      Forecast::Project.all
    end
  end

  def self.forecast_project(h_id)
    all_forecast_projects.find { |p| p.attributes['harvest_id'] == h_id }
  end

  def self.all_forecast_people
    Rails.cache.fetch 'all_forecast_people' do
      Forecast::Person.all
    end
  end

  def self.forecast_person(h_id)
    all_forecast_people.find { |p| p.attributes['harvest_user_id'] == h_id }
  end


  ###################
  # storing functions

  def self.store_all_people
    api.users.all.each do |u|
      f_pers = forecast_person(u['id'])
      next unless f_pers
      capacity = f_pers.attributes['weekly_capacity'] || 0
      person = Person.find_or_initialize_by(harvest_id: u['id'])
      person.update(
        name: "#{u['first_name']} #{u['last_name']}",
        forecast_id: f_pers.attributes['id'],
        is_contractor: u['is_contractor'],
        is_active: u['is_active'],
        is_archived: f_pers.attributes['archived'],
        avatar_url: f_pers.attributes['avatar_url'],
        weekly_capacity: (capacity / 3600).round(2),
      )
    end
  end

  def self.store_all_projects
    api.projects.all.each do |p|
      f_proj = forecast_project(p['id'])
      f_proj ||= Hashie::Mash.new(attributes: {})
      project = Project.find_or_initialize_by(harvest_id: p['id'])
      project.update(
        name: p['name'],
        forecast_id: f_proj.attributes['id'],
        is_active: p['active'],
        is_billable: p['billable'],
        is_archived: f_proj.attributes['archived'],
      )
    end
  end

  def self.store_all_assignments
    Forecast::Assignment.all.each do |assn|
      attrs = assn.attributes
      fa = ForecastAssignment.find_or_initialize_by(forecast_id: attrs['id'])
      fa.update(
        start_date: Date.parse(attrs['start_date']),
        end_date: Date.parse(attrs['end_date']),
        allocation: attrs['allocation'],
        forecast_person_id: attrs['person_id'],
        forecast_project_id: attrs['project_id'],
      )
    end
  end

  def self.store_all_logs(query = :all, start_date = 1.year.ago)
    # `query` can be :all or :active
    Person.send(query).each do |p|
      reports = api.reports.time_by_user(p.harvest_id, start_date, Date.today, billable: true)
      puts "#{reports.count} reports for #{p.name}"
      reports.each do |report|
        log = HarvestLog.find_or_initialize_by(harvest_id: report['id'])
        log.update(
          spent_at: report['spent_at'],
          notes: report['notes'],
          hours: report['hours'],
          task_id: report['task_id'],
          harvest_project_id: report['project_id'],
          harvest_user_id: report['user_id'],
        )
      end
    end
  end

  #########
  # helpers

  def self.num_of_weekdays(beginning_date, end_date)
    (beginning_date..end_date).select { |d| (1..5).cover?(d.wday) }.size
  end
end
