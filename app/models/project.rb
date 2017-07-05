# harvest + forecast project data
class Project
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :harvest_id, type: Integer
  field :forecast_id, type: Integer
  field :is_billable, type: Boolean
  field :is_active, type: Boolean
  field :is_archived, type: Boolean

  index({ harvest_id: 1 }, unique: true)
end
