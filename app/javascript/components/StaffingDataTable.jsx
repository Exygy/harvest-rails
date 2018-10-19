import { map, some, includes, capitalize, sumBy } from 'lodash'
import { connect } from 'react-refetch'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import StaffingTableHeader from './StaffingTableHeader'
import WeeklyTimesheet from './WeeklyTimesheet'
import { getPeriodTitleAndStart, setPeriodData, configureMoment } from '../utils/dateUtils'

const StaffingDataTable = (props, context) => {
  let { timesheetFetch } = props
  let data = {}
  let date = props.match.params.date
  let period = props.match.params.period || 'week'
  let timesheets = []

  if (timesheetFetch.fulfilled) {
    data = timesheetFetch.value.data

    setPeriodData(data, date, period)

    var { periodTitle, periodStart } = getPeriodTitleAndStart(date, period)

    var columns = [
      {
        Header: 'Name',
        accessor: 'name',
        filterable: true,
        filterMethod: (filter, row) => {
          let projNames = map(row._original.timesheets, t => t.project)
          return some(map(projNames, n => includes(n.toLowerCase(), filter.value.toLowerCase())))
        },
        Filter: ({filter, onChange}) => (
          <input
            type='text'
            onChange={event => onChange(event.target.value)}
            placeholder='Project Name'
          />
        ),
        Footer: 'TOTAL'
      },
      {
        Header: 'Target',
        accessor: 'period_capacity',
        Footer: (props) => {
          return  sumBy(props.data, 'period_capacity').toFixed(2)
        }
      },
      {
        Header: 'Forecast',
        accessor: 'total_forecasted',
        Footer: (props) => {
          return  sumBy(props.data, 'total_forecasted').toFixed(2)
        }
      },
      {
        Header: 'Forecast To Date',
        accessor: 'total_forecasted_to_date',
        Footer: (props) => {
          return  sumBy(props.data, 'total_forecasted_to_date').toFixed(2)
        }
      },
      {
        Header: 'Actual To Date',
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
          return  sumBy(props.data, 'total_hours').toFixed(2)
        },
      },
      {
        Header: 'Actual - Target',
        accessor: 'diff_target_actual',
        Footer: (props) => {
          return Math.round(sumBy(props.data, 'diff_target_forecast') * 100) / 100
        }
      },
      {
        Header: 'Forecast - Target',
        accessor: 'diff_target_forecast',
        Footer: (props) => {
          return Math.round(sumBy(props.data, 'diff_target_forecast') * 100) / 100
        }
      },
      {
        Header: 'Actual - Forecast',
        accessor: 'diff_forecast_actual',
        Footer: (props) => {
          return Math.round(sumBy(props.data, 'diff_forecast_actual') * 100) / 100
        }
      },
      {
        Header: 'Actual - Forecast %',
        id: d => (100 * d.diff_forecast_actual / (d.total_forecasted_to_date || 1)),
        accessor: d => parseFloat((100 * d.diff_forecast_actual / (d.total_forecasted_to_date || 1)).toFixed(2)),
        Cell: row => (`${row.value}%`),
        Footer: (props) => {
          let total_f = sumBy(props.data, 'total_forecasted_to_date')
          let total_h = sumBy(props.data, 'total_hours')
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
      {
        Header: 'Active?',
        id: 'is_active',
        accessor: 'is_active',
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

    timesheets = (
      <ReactTable
        data={data}
        columns={columns}
        defaultPageSize={30}
        pageSizeOptions={[10, 20, 30, 40, 50]}
        defaultFiltered={[
          {
            id: 'is_active',
            value: 'true'
          }
        ]}
        SubComponent={(row) =>
          <WeeklyTimesheet person={row.original} />
        }
      />
    )

    return (
      <div>
        <StaffingTableHeader
          title={periodTitle}
          period={period}
          startDate={periodStart}
          router={context.router}
        />
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

StaffingDataTable.contextTypes = {
  router: PropTypes.object
}

export default connect(props => {
  let configuredMoment = configureMoment()
  let date = props.match.params.date || configuredMoment().format('YYYY-MM-DD')
  let period = props.match.params.period || 'week'
  return {
    timesheetFetch: `/api/v1/timesheets/search.json?date=${date}&period=${period}`
  }
})(StaffingDataTable)
