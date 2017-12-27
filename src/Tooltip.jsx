/* eslint jsx-a11y/mouse-events-have-key-events: 0 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import styles from './index.styl';

class Tooltip extends PureComponent {
    static propTypes = {
        type: PropTypes.oneOf([
            'tooltip',
            'infotip'
        ]),
        placement: PropTypes.oneOf([
            'top',
            'right',
            'bottom',
            'left'
        ]),
        relativePosition: PropTypes.bool,
        enterDelay: PropTypes.number, // The delay length (in ms) before popups appear.
        leaveDelay: PropTypes.number, // The delay length (in ms) between the mouse leaving the target and tooltip disappearance.
        spacing: PropTypes.number, // The spacing between target and tooltip
        // contents
        targetWrapClassName: PropTypes.string, // The className apply to target container
        targetWrapStyle: PropTypes.object, // The style apply to target container
        tooltipClassName: PropTypes.string, // The className apply to tooltip itself. You can use it to override style portal if need
        tooltipStyle: PropTypes.object, // The style apply to tooltip itself. You can use it to override style portal if need
        content: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.object,
            PropTypes.string
        ]).isRequired
    };
    static defaultProps = {
        type: 'tooltip',
        placement: 'top',
        relativePosition: false,
        enterDelay: 0, // milliseconds
        leaveDelay: 100, // milliseconds
        spacing: 0, // in px
        targetWrapClassName: '',
        targetWrapStyle: {}
    };

    timeoutID = {
        show: null,
        hide: null
    };

    state = {
        placement: this.props.placement,
        show: false,
        offset: {
            top: 0,
            left: 0
        }
    };

    actions = {
        handleOnMouseOver: (e) => {
            clearTimeout(this.timeoutID.show);
            clearTimeout(this.timeoutID.hide);

            this.timeoutID.show = setTimeout(() => {
                this.setState(state => ({
                    ...state,
                    show: true
                }));
            }, this.props.enterDelay);
        },
        handleOnMouseOut: (e) => {
            clearTimeout(this.timeoutID.show);
            clearTimeout(this.timeoutID.hide);

            this.timeoutID.hide = setTimeout(() => {
                this.setState(state => ({
                    ...state,
                    show: false
                }));
            }, this.props.leaveDelay);
        }
    };

    renders = {
        renderTooltip: () => {
            const {
                relativePosition,
                tooltipClassName,
                tooltipStyle
            } = this.props;
            const { show, placement, offset } = this.state;
            const style = {
                top: offset.top,
                left: offset.left,
                ...tooltipStyle
            };

            return (
                <div
                    ref={node => {
                        this.tooltip = node;
                    }}
                    style={style}
                    className={classNames(
                        styles.tooltip,
                        tooltipClassName,
                        { [styles.screenPosition]: !relativePosition },
                        { [styles.show]: show },
                        { [styles.in]: show },
                        styles[placement]
                    )}
                >
                    {this.renders.renderArrow()}
                    {this.renders.renderContent()}
                </div>
            );
        },
        renderArrow: () => {
            const { type } = this.props;

            if (type === 'infotip') {
                return null;
            }

            return (<div className={styles.tooltipArrow} />);
        },
        renderContent: () => {
            const { type, content } = this.props;
            const isFunction = typeof (content) === 'function';

            return (
                <div
                    className={classNames(
                        styles.tooltipInner,
                        { [styles.tooltipInnerLight]: type === 'infotip' }
                    )}
                >
                    {isFunction &&
                        content()
                    }
                    {!isFunction &&
                        content
                    }
                </div>
            );
        }
    };

    adjustPlacement = () => {
        const {
            placement: prevPlacement,
            offset: prevOffset
        } = this.state;
        const {
            placement: nextPlacement,
            relativePosition,
            spacing
        } = this.props;
        const target = this.tooltipTarget;
        const tooltip = this.tooltip;

        const nextOffset = {
            top: 0,
            left: 0
        };

        let targetPosition;
        if (relativePosition === false) {
            const boundingClientRect = target.getBoundingClientRect(); // position relative to the viewport.
            targetPosition = {
                x: boundingClientRect.left,
                y: boundingClientRect.top
            };
        } else {
            targetPosition = {
                x: target.offsetLeft,
                y: target.offsetTop
            };
        }

        const targetSize = {
            width: target.clientWidth,
            height: target.clientHeight
        };
        const tooltipSize = {
            width: tooltip.clientWidth,
            height: tooltip.clientHeight
        };

        if (nextPlacement === 'top') {
            nextOffset.top = Math.floor(targetPosition.y - tooltipSize.height - spacing);
            nextOffset.left = Math.floor(targetPosition.x + (targetSize.width / 2) - (tooltipSize.width / 2));
        }

        if (nextPlacement === 'right') {
            nextOffset.top = Math.floor(targetPosition.y + (targetSize.height / 2) - (tooltipSize.height / 2));
            nextOffset.left = Math.floor(targetPosition.x + targetSize.width + spacing);
        }

        if (nextPlacement === 'bottom') {
            nextOffset.top = Math.floor(targetPosition.y + targetSize.height + spacing);
            nextOffset.left = Math.floor(targetPosition.x + (targetSize.width / 2) - (tooltipSize.width / 2));
        }

        if (nextPlacement === 'left') {
            nextOffset.top = Math.floor(targetPosition.y + (targetSize.height / 2) - (tooltipSize.height / 2));
            nextOffset.left = Math.floor(targetPosition.x - tooltipSize.width - spacing);
        }

        if ((prevPlacement !== nextPlacement) || (prevOffset.top !== nextOffset.top) || (prevOffset.left !== nextOffset.left)) {
            this.setState((prevState, props) => {
                return {
                    ...prevState,
                    placement: nextPlacement,
                    offset: nextOffset
                };
            });
        }
    };

    componentDidUpdate(prevProps, prevState) {
        this.adjustPlacement();
    }
    render() {
        const {
            className,
            children,
            targetWrapClassName,
            targetWrapStyle,
            ...props
        } = this.props;

        // Remove props do not need to set into div
        delete props.type;
        delete props.placement;
        delete props.relativePosition;
        delete props.enterDelay;
        delete props.leaveDelay;
        delete props.spacing;
        delete props.tooltipClassName;
        delete props.tooltipStyle;
        delete props.content;

        return (
            <div
                {...props}
                ref={node => {
                    this.tooltipContainer = node;
                }}
                className={classNames(
                    styles.tooltipContainer,
                    className
                )}
            >
                {this.renders.renderTooltip()}
                <div
                    ref={node => {
                        this.tooltipTarget = node;
                    }}
                    style={targetWrapStyle}
                    className={classNames(
                        styles.tooltipTargetContainer,
                        targetWrapClassName
                    )}
                    onMouseOver={this.actions.handleOnMouseOver}
                    onMouseOut={this.actions.handleOnMouseOut}
                >
                    {children}
                </div>
            </div>
        );
    }
}

export default Tooltip;
