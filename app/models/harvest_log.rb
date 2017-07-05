# harvest time log
class HarvestLog
  include Mongoid::Document

  field :harvest_id, type: Integer
  field :spent_at, type: Date
  field :notes, type: String
  field :hours, type: Float
  field :task_id, type: Integer
  field :harvest_project_id, type: Integer
  field :harvest_user_id, type: Integer

  index({ harvest_id: 1 }, unique: true)
  index({ harvest_user_id: 1 }, unique: false)
end
