# RESTful JSON API to retrieve data for projects
class Api::V1::ProjectsController < ApiController
  def search
    starts_on, ends_on = DateService.calculate_date_range(params[:date], params[:period])
    @projects = HarvestV2Service.projects({starts_on: starts_on, ends_on: ends_on})
    render json: { projects: @projects }
  end
end
