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
end
