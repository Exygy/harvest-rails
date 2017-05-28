import { connect } from 'react-refetch'
import PropTypes from 'prop-types'

const Hello = (props) => {
  let data = '(loading...)'
  if (props.timesheetFetch.fulfilled) {
    data = props.timesheetFetch.value.data
  }
  return (
    <div>
      <h1>Greetings</h1>
      <p>
        Hello {props.name}!
      </p>
      <p>
        Hola {data}!
      </p>
    </div>
  )
}

Hello.defaultProps = {
  name: 'David'
}

Hello.propTypes = {
  name: PropTypes.string
}

export default connect(props => ({
  timesheetFetch: `/api/v1/timesheets/search.json`
}))(Hello)
