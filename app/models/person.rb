# harvest + forecast person data
class Person
  include Mongoid::Document
  has_many :harvest_logs

  field :name, type: String
  field :harvest_id, type: Integer
  field :forecast_id, type: Integer
  field :is_contractor, type: Boolean
  field :is_active, type: Boolean
  field :avatar_url, type: String
  field :weekly_capacity, type: Float
end
