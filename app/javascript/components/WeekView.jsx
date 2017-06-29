import moment from 'moment'
import { connect } from 'react-refetch'
import PropTypes from 'prop-types'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
// import WeeklyTimesheet from './WeeklyTimesheet'


const WeekView = (props) => {
  let { timesheetFetch } = props
  let data = {}
  let week = props.match.params.week
  let weekBeginning = moment().add(week, 'weeks').startOf('isoweek').format('MMMM Do YYYY')
  let timesheets = []
  if (timesheetFetch.fulfilled) {
    data = timesheetFetch.value.data
    // data.forEach((person) => {
    //   if (person.total_forecasted === 0) return
    //   timesheets.push(
    //     <WeeklyTimesheet person={person} key={person.name} />
    //   )
    // })

    timesheets = (
      <BootstrapTable data={ data }>
        <TableHeaderColumn dataField='name' isKey>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='total_forecasted'>Forecast</TableHeaderColumn>
        <TableHeaderColumn dataField='total_hours'>Actual</TableHeaderColumn>
      </BootstrapTable>
    )

    return (
      <div>
        <h1>Timesheet for {weekBeginning}</h1>
        {timesheets}
      </div>
    )
  } else {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    )
  }

}

WeekView.propTypes = {
  match: PropTypes.object
}

export default connect(props => {
  let week = props.match.params.week || 0
  return {
    timesheetFetch: `/api/v1/timesheets/search.json?week=${week}`
  }
})(WeekView)
