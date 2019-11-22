# wrapper for Forecast API V2
class ForecastV2Service
  # TO DO -- Need to switch this over to either just use API or use Forecast -- need more information
  def self.forecast_assignments_for_range(project, begin_date, end_date)
    # puts "getting assignments... person_id: #{person.forecast_id}"
    assignments = ForecastAssignment.where(
      :end_date.gte => begin_date,
      :start_date.lte => end_date,
    )
    assignments.group_by(&:forecast_project_id).collect do |forecast_id, assns|
      forecasted = assns.collect do |assn|
        next unless assn.allocation
        next unless project && project.is_billable
        hrs = assn.allocation / 3600.0
        period_start = [assn.start_date, begin_date].max
        period_end = [assn.end_date, end_date].min
        business_days = num_of_weekdays(period_start, period_end)
        hrs * business_days
      end.compact.sum

      forecasted_to_date = assns.collect do |assn|
        next unless assn.allocation
        next unless project && project.is_billable
        hrs = assn.allocation / 3600.0
        period_start = [assn.start_date, begin_date].max
        period_end = [assn.end_date, end_date, today].min
        business_days = num_of_weekdays(period_start, period_end)
        hrs * business_days
      end.compact.sum

      Hashie::Mash.new(
        project_id: forecast_project_id,
        forecasted: forecasted,
        forecasted_to_date: forecasted_to_date || 0
      )
    end
  end
end
