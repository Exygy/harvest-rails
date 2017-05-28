# RESTful JSON API to retrieve data for timesheets
class Api::V1::TimesheetsController < ApiController
  def search
    render json: { data: 'World' }
  end
end
