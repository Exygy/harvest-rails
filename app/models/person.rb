# harvest + forecast person data
class Person
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :harvest_id, type: Integer
  field :forecast_id, type: Integer
  field :is_contractor, type: Boolean
  field :is_active, type: Boolean # comes from harvest
  field :is_archived, type: Boolean # comes from forecast
  field :avatar_url, type: String
  field :weekly_capacity, type: Float

  index({ harvest_id: 1 }, unique: true)

  def self.active
    where(is_active: true, is_archived: false)
  end

  def harvest_logs
    HarvestLog.where(harvest_user_id: harvest_id)
  end
end
