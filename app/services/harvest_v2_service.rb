# wrapper for Harvest API
class HarvestV2Service
  def self.api
    Harvesting::Client.new
  end

  def self.projects(opts = {})
    p 'Harvestv2 opts'
    p opts
    api.projects(opts).entries
  end

  def self.user_assignments(project_id)
    api.user_assignments({project_id: project_id})
  end

  # returns the total actual hours of a user for a project in a date range
  def self.total_actual_hours(opts = {})
    total_hours = opts[:total_hours] || 0
    project_user_time_entries = project_user_time_entries(opts)

    # iterate through each page of and add up all the hours of each entry
    if  project_user_time_entries.page != project_user_time_entries.total_pages
      opts[:page] = project_user_time_entries.page += 1
      total_hours += project_user_time_entries(opts).entries.sum(&:hours)
      opts[:total_hours] = total_hours
      total_actual_hours(opts)
    else
      opts[:total_hours]
    end
  end

  def self.forecasted_hours(opts = {})

  end

  private

  # returns the time entries for a user for a project from a date range
  def self.project_user_time_entries(opts = {})
    api.time_entries(opts)
  end
end
