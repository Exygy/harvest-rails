# wrapper for Forecast API
class ForecastService
  # The Forecast gem currently only supports searching for projects
  # by ID, so we have to have the Time Off Project ID here. Would
  # be nice in the future to see if the gem can be extended to
  # support searching by project name.
  TIME_OFF_PROJECT_ID = 297236

  # Gets the Time Off project from Forecast. This project is not
  # synced to Harvest so we don't get it when doing store_all_projects
  # in the HarvestService.
  def self.store_time_off_project
    proj = Forecast::Project.get(TIME_OFF_PROJECT_ID)
    if !Project.where(forecast_id: proj.id).exists?
      Project.create(
        forecast_id: proj.id,
        name: proj.name,
        harvest_id: proj.harvest_id,
        is_archived: proj.archived,
      )
    end
  end

  def self.all_forecast_projects
    Rails.cache.fetch 'all_forecast_projects' do
      Forecast::Project.all
    end
  end

  def self.forecast_project(harvest_id)
    all_forecast_projects.find do |p|
      p.attributes['harvest_id'] == harvest_id
    end
  end

  def self.all_forecast_people
    Rails.cache.fetch 'all_forecast_people' do
      Forecast::Person.all
    end
  end

  def self.forecast_person(harvest_id)
    all_forecast_people.find do |p|
      p.attributes['harvest_user_id'] == harvest_id
    end
  end
end
