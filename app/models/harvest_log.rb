# harvest time log
class HarvestLog
  include Mongoid::Document
  belongs_to :person

  field :harvest_id, type: Integer
  field :spent_at, type: Date
  field :notes, type: String
  field :hours, type: Float
  field :task_id, type: Integer
  field :harvest_project_id, type: Integer
end
