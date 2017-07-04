import moment from 'moment'
import { connect } from 'react-refetch'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ReactTable from 'react-table'
// import WeeklyTimesheet from './WeeklyTimesheet'

const StaffingDataTable = (props) => {
  let { timesheetFetch } = props
  let data = {}
  let date = props.match.params.date
  // let startDate = moment(date).add(week, 'weeks').startOf('isoweek').format('MMMM Do YYYY')
  let period = props.match.params.period
  let startDate = moment(date).startOf(period).format('MMMM Do YYYY')
  let timePeriod = ''
  switch (period) {
    case 'month':
      timePeriod = `${moment(date).format('MMMM')}`
      break
    case 'quarter':
      timePeriod = `Q${moment(date).format('Q')}: ${startDate}`
      break
    case 'year':
      timePeriod = `${moment(date).format('Y')} to date`
      break
    case 'week':
    default:
      startDate = moment(date).startOf('isoweek').format('MMMM Do YYYY')
      timePeriod = `Week ${moment(date).format('W')}: ${startDate}`
      break
  }
  let timesheets = []
  if (timesheetFetch.fulfilled) {
    data = timesheetFetch.value.data

    var columns = [
      {
        Header: 'Name',
        accessor: 'name',
        Footer: 'TOTAL'
      },
      {
        Header: 'Forecast',
        accessor: 'total_forecasted',
        Footer: (props) => {
          return  _.sumBy(props.data, 'total_forecasted').toFixed(2)
        }
      },
      {
        Header: 'Actual',
        accessor: 'total_hours',
        filterable: true,
        filterMethod: (filter, row) => {
          if (filter.value === 'all') return true
          if (filter.value === 'gt_0') {
            return row[filter.id] > 0
          }
        },
        Filter: ({filter, onChange}) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{width: '100%'}}
            value={filter ? filter.value : 'both'}
          >
            <option value='all'>All</option>
            <option value='gt_0'>&gt;0</option>
          </select>
        ),
        Footer: (props) => {
          return  _.sumBy(props.data, 'total_hours').toFixed(2)
        },
      },
      {
        Header: 'Difference',
        accessor: 'diff',
        Footer: (props) => {
          return  _.sumBy(props.data, 'diff').toFixed(2)
        }
      },
      {
        Header: 'Diff %',
        id: d => 100 * d.diff / (d.total_forecasted || 1),
        accessor: d => (100 * d.diff / (d.total_forecasted || 1)).toFixed(2),
        Footer: (props) => {
          let total_f = _.sumBy(props.data, 'total_forecasted')
          let total_h = _.sumBy(props.data, 'total_hours')
          let total_d = total_h - total_f
          return (100 * total_d / total_f).toFixed(2)
        }
      },
      {
        Header: 'Contractor?',
        id: 'is_contractor',
        accessor: 'is_contractor',
        Cell: ({value}) => (value ? 'Yes' : 'No'),
        filterable: true,
        filterMethod: (filter, row) => {
          if (filter.value === 'both') return true
          if (filter.value === 'true') return row[filter.id] === true
          if (filter.value === 'false') return row[filter.id] === false
        },
        Filter: ({filter, onChange}) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{width: '100%'}}
            value={filter ? filter.value : 'both'}
          >
            <option value='both'>Both</option>
            <option value='true'>Yes</option>
            <option value='false'>No</option>
          </select>
        )
      },
    ]

    // defaultFiltered={[
    //   {
    //     id: 'total_hours',
    //     value: 'gt_0'
    //   }
    // ]}

    timesheets = (
      <ReactTable
        data={ data }
        columns={ columns }
        defaultPageSize={ 30 }
        pageSizeOptions={[10, 20, 30, 40, 50]}
      />
    )

    return (
      <div>
        <h1>{timePeriod}</h1>
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

StaffingDataTable.propTypes = {
  match: PropTypes.object
}

export default connect(props => {
  let date = props.match.params.date || moment().format('YYYY-MM-DD')
  let period = props.match.params.period || 'week'
  return {
    timesheetFetch: `/api/v1/timesheets/search.json?date=${date}&period=${period}`
  }
})(StaffingDataTable)
