import PropTypes from 'prop-types'
import { ProgressBar } from 'react-bootstrap'

const WeeklyTimesheet = (props) => {
  let { person } = props
  // let percentage = parseFloat(person.total_hours / person.total_forecasted)
  let timesheets = []
  person.timesheets.forEach(timesheet => {
    let percentage = parseFloat(timesheet.total / timesheet.forecasted)
    if (percentage === Infinity) {
      percentage = 9.99
    }
    let pct = `${(percentage * 100).toFixed(2)}%`
    timesheets.push(
      <div key={timesheet.project_id}>
        <div>{timesheet.project} : {timesheet.total.toFixed(2)} billed / {timesheet.forecasted.toFixed(2)} forecasted</div>
        <ProgressBar now={percentage * 100} label={pct} />
      </div>
    )
  })

  return (
    <div>
      <style type="text/css">{`
      .progress .progress-bar {
        font-size: 12px;
        line-height: 25px;
        max-width: 500px;
      }
      .progress {
        height: 25px;
        max-width: 500px;
      }
      `}</style>
      <div style={{padding: '15px'}}>
        {/* <h3>{person.name} {(percentage * 100).toFixed(2) }% ({person.total_hours} / {person.total_forecasted})</h3> */}
        {/* <progress value={percentage.toFixed(2)} /> */}
        {timesheets}
        <hr />
      </div>
    </div>
  )
}

WeeklyTimesheet.propTypes = {
  person: PropTypes.object
}

export default WeeklyTimesheet
