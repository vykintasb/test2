import React from 'react';

import ClickableElement from './ClickableElement';
import style from './Link.css';

const Link = props => (
  <ClickableElement classNames={{ link: true }} stylesheet={style} {...props} />
);

export default Link;
