// absolutely positioned frame
//

export default function Absolute(props) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}>
      { props.children }
    </div>
  )
}
