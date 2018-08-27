import moment from 'moment-business-days'
import _ from 'lodash'
import { connect } from 'react-refetch'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import StaffingTableHeader from './StaffingTableHeader'
import WeeklyTimesheet from './WeeklyTimesheet'

const StaffingDataTable = (props, context) => {
  let { timesheetFetch } = props
  let data = {}
  let date = props.match.params.date
  // let startDate = moment(date).add(week, 'weeks').startOf('isoweek').format('MMMM Do YYYY')
  let period = props.match.params.period || 'week'
  let startDate = moment(date).startOf(period).format('MMMM Do YYYY')

  // Configure moment with holidays
  var year = moment(date).year()
  var newYears1 = `01-01-${year}`
  var newYears2 = `01-02-${year}`
  var mlkDay = `01-16-${year}`
  var presidentsDay = `02-20-${year}`
  var memorialDay = `05-29-${year}`
  var fourthOfJuly = `07-04-${year}`
  var laborDay = `09-04-${year}`
  var columbusDay = `10-09-${year}`
  var veteransDay = `11-10-${year}`
  var thanksgiving1 = `11-23-${year}`
  var thanksgiving2 = `11-24-${year}`
  var xmas = `12-25-${year}`
  moment.locale('us', {
    holidays: [
      newYears1, newYears2, mlkDay, presidentsDay, memorialDay, fourthOfJuly,
      laborDay,columbusDay, veteransDay, thanksgiving1, thanksgiving2, xmas
    ],
    holidayFormat: 'MM-DD-YYYY'
  });

  let timePeriod = ''
  switch (period) {
    case 'month':
      timePeriod = `${moment(date).format('MMMM Y')}`
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

  const setPeriodData  = (data) => {
    data.forEach(d => {
      let dailyCapacity = d.weekly_capacity / 5
      let periodCapacity = 0
      switch (period) {
        case 'month':
          periodCapacity = dailyCapacity * moment(date).monthBusinessDays().length
          break
        case 'quarter':
          let q = moment(date).quarter()
          let quarterMonths = [
            moment().month(3 * q - 3),
            moment().month(3 * q - 2),
            moment().month(3 * q - 1)
          ]
          let quarterDays = _.reduce(
            quarterMonths,
            (sum, month) => {
              return sum + month.monthBusinessDays().length
            },
            0
          )
          periodCapacity = dailyCapacity * quarterDays
          break
        case 'year':
          let yearDays = 0
          for (var i = 0; i < 12; i++) {
            yearDays += moment().month(i).monthBusinessDays().length
          }
          periodCapacity = dailyCapacity * yearDays
          break
        case 'week':
        default:
          periodCapacity = d.weekly_capacity
          break
      }
      d.period_capacity = Math.round(periodCapacity * 100) / 100

      d.diff_target_forecast = Math.round((d.total_forecasted - d.period_capacity) * 100) / 100
    })
  }

  let timesheets = []
  if (timesheetFetch.fulfilled) {
    data = timesheetFetch.value.data

    setPeriodData(data)
    console.log(data)
    var columns = [
      {
        Header: 'Name',
        accessor: 'name',
        filterable: true,
        filterMethod: (filter, row) => {
          let projNames = _.map(row._original.timesheets, t => t.project)
          return _.some(_.map(projNames, n => _.includes(n.toLowerCase(), filter.value.toLowerCase())))
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
        Header: props => {
          return `${_.capitalize(period)}ly Target`
        },
        accessor: 'period_capacity',
        Footer: (props) => {
          return  _.sumBy(props.data, 'period_capacity').toFixed(2)
        }
      },
      {
        Header: props => {
          return `${_.capitalize(period)}ly Forecast`
        },
        accessor: 'total_forecasted',
        Footer: (props) => {
          return  _.sumBy(props.data, 'total_forecasted').toFixed(2)
        }
      },
      {
        Header: 'Forecast To Date',
        accessor: 'total_forecasted_to_date',
        Footer: (props) => {
          return  _.sumBy(props.data, 'total_forecasted_to_date').toFixed(2)
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
          return  _.sumBy(props.data, 'total_hours').toFixed(2)
        },
      },
      {
        Header: 'Diff Target to Forecast',
        accessor: 'diff_target_forecast',
        Footer: (props) => {
          return Math.round(_.sumBy(props.data, 'diff_target_forecast') * 100) / 100
        }
      },
      {
        Header: 'Diff Forecast to Actual',
        accessor: 'diff_forecast_actual',
        Footer: (props) => {
          return Math.round(_.sumBy(props.data, 'diff_forecast_actual') * 100) / 100
        }
      },
      {
        Header: 'Diff Forecast to Actual %',
        id: d => (100 * d.diff_forecast_actual / (d.total_forecasted_to_date || 1)),
        accessor: d => parseFloat((100 * d.diff_forecast_actual / (d.total_forecasted_to_date || 1)).toFixed(2)),
        Cell: row => (`${row.value}%`),
        Footer: (props) => {
          let total_f = _.sumBy(props.data, 'total_forecasted_to_date')
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
        data={ data }
        columns={ columns }
        defaultPageSize={ 30 }
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
          title={timePeriod}
          period={period}
          startDate={startDate}
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
  let date = props.match.params.date || moment().format('YYYY-MM-DD')
  let period = props.match.params.period || 'week'
  return {
    timesheetFetch: `/api/v1/timesheets/search.json?date=${date}&period=${period}`
  }
})(StaffingDataTable)
