import moment from 'moment-business-days'
import { reduce } from 'lodash'

export const configureMoment = date => {
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
  return moment
}

export const getPeriodTitleAndStart = (date, period) => {
  let configuredMoment = configureMoment(date)
  let momentDate = configuredMoment(date)
  let periodStart = configuredMoment().startOf(period).format('MMMM Do YYYY')
  let periodTitle

  switch (period) {
    case 'month':
      periodTitle = `${momentDate.format('MMMM Y')}`
      break
    case 'quarter':
      periodTitle = `Q${momentDate.format('Q')}: ${periodStart}`
      break
    case 'year':
      periodTitle = `${momentDate.format('Y')} to date`
      break
    case 'week':
    default:
      periodStart = momentDate.startOf('isoweek').format('MMMM Do YYYY')
      periodTitle = `Week ${momentDate.format('W')}: ${periodStart}`
      break
  }

  return {periodTitle: periodTitle, periodStart: periodStart}
}

// TODO: This function does staffing-table-specific things. Move it
// closer to the staffing table component.
export const setPeriodData = (data, date, period) => {
  let configuredMoment = configureMoment()
  let momentDate = configuredMoment(date)

  data.forEach(d => {
    let dailyCapacity = d.weekly_capacity / 5
    let periodCapacity = 0
    switch (period) {
      case 'month':
        periodCapacity = dailyCapacity * momentDate.monthBusinessDays().length
        break
      case 'quarter':
        let q = momentDate.quarter()
        let quarterMonths = [
          configuredMoment().month(3 * q - 3),
          configuredMoment().month(3 * q - 2),
          configuredMoment().month(3 * q - 1)
        ]
        let quarterDays = reduce(
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
          yearDays += configuredMoment().month(i).monthBusinessDays().length
        }
        periodCapacity = dailyCapacity * yearDays
        break
      case 'week':
      default:
        periodCapacity = d.weekly_capacity
        break
    }
    periodCapacity = Math.round(periodCapacity * 100) / 100
    d.period_capacity = Math.max(periodCapacity - d.time_off, 0)
    d.diff_target_forecast = Math.round((d.total_forecasted - d.period_capacity) * 100) / 100
  })
}
