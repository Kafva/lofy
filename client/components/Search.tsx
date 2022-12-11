import '../scss/Search.module.scss';

const Search = (props: {
  setQueryString: (arg0: string) => any,
}) => {
  let input: HTMLInputElement

  return (<>
    <input ref={input!} type="text" placeholder="Search..."
      autocomplete="off" autocapitalize="off"
      onKeyDown={(e:KeyboardEvent) => {
        switch (e.key) {
        case 'Backspace':
          props.setQueryString(input.value.slice(0,-1))
          break;
        case 'Enter':
          input.blur()
          break;
        default:
          const value = e.key.length == 1 ? input.value + e.key : input.value
          props.setQueryString(value)
        }
      }}
    />
  </>);
};

export default Search

