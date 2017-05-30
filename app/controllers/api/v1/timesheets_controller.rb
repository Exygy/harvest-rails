# RESTful JSON API to retrieve data for timesheets
class Api::V1::TimesheetsController < ApiController
  def search
    week = params[:week].to_i || 0
    @data = HarvestService.weekly_data(week)
    render json: { data: @data }
  end
end
