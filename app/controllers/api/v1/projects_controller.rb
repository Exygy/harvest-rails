# RESTful JSON API to retrieve data for projects
class Api::V1::ProjectsController < ApiController
  def search
    starts_on, ends_on = DateService.calculate_date_range(params[:date], params[:period])
    @projects = HarvestV2Service.projects
    @forecast_assignments = ForecastAssignment.where(:start_date.lte => starts_on, :end_date.gte => ends_on)
    binding.pry
    render json: { projects: @projects, forecast_assignments: @forecast_assignments }
  end
end
