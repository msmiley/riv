
export default function RivLogo() {

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5em',
    textShadow: '0px 0px 4px rgba(0,0,0,0.3)',
    width: '100%',
    backgroundColor: '#0079FF',
    color: 'var(--riv-text-color-light)',
    fontFamily: 'Varela',
    cursor: 'pointer',
    padding: '0.1em',
  };

  return (
    <div className="riv-logo" style={style}>riv</div>
  )
}
