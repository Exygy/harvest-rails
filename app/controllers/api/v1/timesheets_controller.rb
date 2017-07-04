# RESTful JSON API to retrieve data for timesheets
class Api::V1::TimesheetsController < ApiController
  def search
    date = params[:date] || Date.today.to_s
    period = params[:period] || 'week'
    @data = HarvestService.periodic_data(date, period)
    render json: { data: @data }
  end
end
