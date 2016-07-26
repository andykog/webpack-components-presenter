webpack-components-presenter (alpha)
------------------------------------

CLI utility, that works just like `webpack-dev-server`. But it automatically
finds all the files inside you context folder, containing `__demo__` in their
names and serves list of them, so you can run demonstration of your ui
components. Each component should render itself in `#root`:

```js
/* NiceButton__demo__.jsx */
import React, { Component } from 'react';
import { render } from 'react-dom';
import NiceButton from './NiceButton';

export default class NiceButton__demo__ extends Component {
  render() {
    return (
      <div>
        <NiceButton />
      </div>
    );
  }
}

const target = document.querySelector('#root');
if (target) render(<UIPopupsDemo />, target);
```


Just run:

```
components-presenter
```
