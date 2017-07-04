# harvest + forecast project data
class Project
  include Mongoid::Document

  field :name, type: String
  field :harvest_id, type: Integer
  field :forecast_id, type: Integer
  field :is_billable, type: Boolean
  field :is_active, type: Boolean
  field :is_archived, type: Boolean
end


# {"id"=>4195955,
#  "start_date"=>"2017-06-05",
#  "end_date"=>"2017-06-09",
#  "allocation"=>1440,
#  "notes"=>nil,
#  "updated_at"=>"2017-05-15T20:22:52.459Z",
#  "updated_by_id"=>131879,
#  "project_id"=>592481,
#  "person_id"=>131879,
#  "placeholder_id"=>nil,
#  "repeated_assignment_set_id"=>198263}>
#
#  => {"id"=>295919,
#   "client_id"=>120419,
#   "name"=>"ItalySeminars",
#   "code"=>"",
#   "active"=>false,
#   "bill_by"=>"People",
#   "budget"=>nil,
#   "budget_by"=>"none",
#   "notify_when_over_budget"=>false,
#   "over_budget_notification_percentage"=>80.0,
#   "over_budget_notified_at"=>nil,
#   "show_budget_to_all"=>false,
#   "created_at"=>"2009-02-15T05:04:58Z",
#   "updated_at"=>"2015-07-20T17:54:19Z",
#   "starts_on"=>"2009-02-02",
#   "ends_on"=>nil,
#   "estimate"=>nil,
#   "estimate_by"=>"none",
#   "is_fixed_fee"=>false,
#   "billable"=>true,
#   "hint_earliest_record_at"=>nil,
#   "hint_latest_record_at"=>nil,
#   "notes"=>"",
#   "hourly_rate"=>nil,
#   "cost_budget"=>nil,
#   "cost_budget_include_expenses"=>false}
