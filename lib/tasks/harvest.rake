namespace :harvest do
  desc 'Store all data, more of a one time initialization'
  task store_everything: :environment do
    HarvestService.store_all_people
    HarvestService.store_all_projects
    ForecastService.store_time_off_project
    ForecastAssignment.destroy_all
    HarvestService.store_all_assignments
    HarvestService.store_all_logs(:all, 1.year.ago)
  end

  desc 'Update all non-harvest-log data (daily)'
  task store_daily: :environment do
    puts "storing all people..."
    HarvestService.store_all_people
    puts "storing all projects..."
    HarvestService.store_all_projects
    # re-grab all ForecastAssignments every day
    puts "deleting all assignments..."
    ForecastAssignment.destroy_all
    puts "storing all assignments..."
    HarvestService.store_all_assignments
    # grab all harvest logs from the past couple months just in case any were updated
    puts "storing all logs from past two months..."
    HarvestService.store_all_logs(:active, 2.months.ago)
    puts "clearing cache..."
    Rails.cache.clear
  end

  desc 'Update all harvest-log data (once an hour)'
  task store_recent_logs: :environment do
    # store logs for the past couple weeks
    HarvestService.store_all_logs(:active, 2.weeks.ago)
  end
end
