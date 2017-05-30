import PropTypes from 'prop-types'

const WeeklyTimesheet = (props) => {
  let { person } = props
  let percentage = parseFloat(person.total_hours / person.total_forecasted)

  let timesheets = []
  person.timesheets.forEach(timesheet => {
    let percentage = parseFloat(timesheet.total / timesheet.forecasted)
    timesheets.push(
      <div key={timesheet.project_id}>
        <div>{timesheet.project} {(percentage * 100).toFixed(2)}%</div>
        <progress value={percentage.toFixed(2)} />
      </div>
    )
  })

  return (
    <div>
      <h3>{person.name} {(percentage * 100).toFixed(2) }% ({person.total_hours} / {person.total_forecasted})</h3>
      {/* <progress value={percentage.toFixed(2)} /> */}
      {timesheets}
      <hr />
    </div>
  )
}

WeeklyTimesheet.propTypes = {
  person: PropTypes.object
}

export default WeeklyTimesheet
