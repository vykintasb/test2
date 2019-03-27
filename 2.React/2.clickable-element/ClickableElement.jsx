import PropTypes from 'prop-types';
import React from 'react';
import classNamesLib from 'classnames/bind';
import { generateId } from '../../../../utils/numberUtils';

/**
 * Used internally by Button and Link components
 *
 * props:
 *  - stylesheet
 *
 *     CSS stylesheet to use imported as css-module
 *
 *  - classNames
 *
 *     Additional classnames to use: a key-value map
 *
 */
const ClickableElement = ({
  id,
  text,
  onClick,
  type,
  height,
  width,
  disabled,
  href,
  newWindow,
  withComponent,
  children,
  classNames,
  stylesheet,
  inheritColor,
  testParentNameAndFunction,
  ...rest
}) => {
  const classes = classNamesLib.bind(stylesheet);
  const onClickHandler = disabled
    ? () => {}
    : e => {
        e.stopPropagation();
        onClick(e);
      };

  const elementId = typeof id !== 'undefined' ? id : generateId('button');

  const ownClassNames = classes({
    primary: type === 'primary',
    secondary: type === 'secondary',
    small: height === 'small',
    disabled,
    inheritColor,
    ...classNames,
  });

  const content = children || text;

  let Component = props => (
    <button data-test-id={`${testParentNameAndFunction}-button`} {...props}>
      {content}
    </button>
  );

  if (withComponent) {
    Component = withComponent;
  } else if (href) {
    const newWindowProps = newWindow ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    Component = props => (
      <a
        href={href}
        data-test-id={`${testParentNameAndFunction}-link`}
        {...newWindowProps}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Component
      disabled={disabled}
      {...rest}
      id={elementId}
      className={ownClassNames}
      style={{ width }}
      onClick={onClickHandler}
    >
      {content}
    </Component>
  );
};

ClickableElement.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary']).isRequired,
  stylesheet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  id: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  height: PropTypes.oneOf(['normal', 'small']),
  disabled: PropTypes.bool,
  href: PropTypes.string,
  newWindow: PropTypes.bool,
  withComponent: PropTypes.func,
  classNames: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  inheritColor: PropTypes.bool,
  testParentNameAndFunction: PropTypes.string,
};

ClickableElement.defaultProps = {
  id: undefined,
  type: 'primary',
  height: 'normal',
  disabled: false,
  width: null,
  withComponent: null,
  href: null,
  newWindow: false,
  text: null,
  children: null,
  classNames: {},
  onClick: () => {},
  inheritColor: false,
  testParentNameAndFunction: 'Default-field',
};

export default ClickableElement;
