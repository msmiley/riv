import React, { Component } from 'react';

interface TitleProps {
  title: string;
  subtitle?: string;
}

interface TitleState {
  counter: number;
}

export default class Title extends Component<TitleProps, TitleState> {
  public static defaultProps = {
    subtitle: 'Hey there!',
  };

  render() {
    const { title, subtitle, children } = this.props;
    return (
      <>
        <h1>{title} - {this.doSomething()}</h1>
        <h2>{subtitle}</h2>
        <div>{children}</div>
      </>
    );
  }
  doSomething() {
    return 'i did something';
  }
}
