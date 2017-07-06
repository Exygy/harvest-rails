import moment from 'moment'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';


const StaffingTableHeader = (props) => {
  let { period, startDate, router } = props
  let startPeriod = period
  if (period === 'week') startPeriod = 'isoweek'
  startDate = moment(startDate, 'MMMM Do YYYY')
  let prevDate = moment(startDate).subtract(1, period).format('YYYY-MM-DD')
  let nextDate = moment(startDate).add(1, period).format('YYYY-MM-DD')
  let currentDate = moment().startOf(startPeriod).format('YYYY-MM-DD')

  let toPrev = `/search/${prevDate}/${period}`
  let toCurrent = `/search/${currentDate}/${period}`
  let toNext = `/search/${nextDate}/${period}`

  var selectPeriod = (key) => {
    let startPeriod = key
    if (key === 'week') startPeriod = 'isoweek'
    let periodDate = moment().startOf(startPeriod).format('YYYY-MM-DD')
    let href = `/search/${periodDate}/${key}`
    router.history.push(href)
  }

  return (
    <div className="row" style={{padding: '20px'}}>
      <div className="col-md-2">
        <ButtonGroup>
          <Link className='btn btn-default' to={toPrev}>
            ◄
          </Link>
          <Link className='btn btn-default' to={toCurrent}>
            Today
          </Link>
          <Link className='btn btn-default' to={toNext}>
            ►
          </Link>
        </ButtonGroup>
      </div>
      <div className="col-md-8">
        <h1 style={{margin: '0px'}}>
          {props.title}
        </h1>
      </div>
      <div className="col-md-2">

        <DropdownButton title={period} id="dropdown-timeframe">
          <MenuItem onSelect={selectPeriod} eventKey="week" active={period === 'week'}>Week</MenuItem>
          <MenuItem onSelect={selectPeriod} eventKey="month" active={period === 'month'}>Month</MenuItem>
          <MenuItem onSelect={selectPeriod} eventKey="quarter" active={period === 'quarter'}>Quarter</MenuItem>
          <MenuItem onSelect={selectPeriod} eventKey="year" active={period === 'year'}>Year</MenuItem>
        </DropdownButton>

      </div>
    </div>
  )
}

StaffingTableHeader.propTypes = {
  title: PropTypes.string,
  period: PropTypes.string,
  startDate: PropTypes.string,
  router: PropTypes.object,
}

export default StaffingTableHeader
