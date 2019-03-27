import React from 'react';
import ClickableElement from '../ClickableElement';
import style from './Button.css';

const Button = props => (
  <ClickableElement classNames={{ btn: true }} stylesheet={style} {...props} />
);

export default Button;