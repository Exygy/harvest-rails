namespace :harvest do
  desc 'Store all data, more of a one time initialization'
  task store_everything: :environment do
    HarvestService.store_all_people
    HarvestService.store_all_projects
    HarvestService.store_all_assignments
    HarvestService.store_all_logs(:all, 1.year.ago)
  end

  desc 'Update all non-harvest-log data (daily)'
  task store_daily: :environment do
    HarvestService.store_all_people
    HarvestService.store_all_projects
    HarvestService.store_all_assignments
  end

  desc 'Update all harvest-log data (~15m)'
  task store_recent_logs: :environment do
    HarvestService.store_all_logs(:active, 1.week.ago)
  end
end
