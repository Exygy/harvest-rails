# forecast estimate assignment
class ForecastAssignment
  include Mongoid::Document

  field :forecast_id, type: Integer
  field :start_date, type: Date
  field :end_date, type: Date
  field :allocation, type: Integer
  field :forecast_person_id, type: Integer
  field :forecast_project_id, type: Integer

  index({ forecast_id: 1 }, unique: true)
end
