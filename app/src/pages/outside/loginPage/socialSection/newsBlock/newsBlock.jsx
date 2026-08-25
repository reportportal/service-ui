/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from 'classnames/bind';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { parseSentences, stripEmojis } from 'common/utils/stringUtils';
import styles from './newsBlock.scss';
import { PostBlock } from './postBlock';

const cx = classNames.bind(styles);

const MAX_TWEETS = 3;
const STACK_STEP_PX = 34;
const MAX_VISIBLE_LAYERS = 2;
const CYCLE_DURATION_MS = 420;
const WHEEL_FLIP_THRESHOLD = 70;
const WHEEL_FOLLOW_MAX_PX = 26;
const WHEEL_IDLE_RESET_MS = 150;
const DRAG_AXIS_LOCK_PX = 8;
const DRAG_CYCLE_THRESHOLD_PX = 60;
const DRAG_DISMISS_THRESHOLD_PX = 90;
const PEEK_DELAY_MS = 350;
const DISMISS_FLY_OUT_MS = 340;
const UNDO_HIDE_MS = 6000;
const CLICK_SUPPRESS_AFTER_DRAG_MS = 350;
const PROMOTE_RETRY_MS = 90;
const PARALLAX_MAX_DEG = 2;

const NEWS_ELEMENT_NAME_MAX_LENGTH = 80;
const NEWS_SWITCH_DOT_CLICK = 'dot_click';
const NEWS_SWITCH_CARD_CLICK = 'card_click';
const NEWS_SWITCH_CARD_SCROLL = 'card_scroll';
const NEWS_SWITCH_CARD_DRAG_AND_DROP = 'card_drag_and_drop';

const messages = defineMessages({
  undo: {
    id: 'NewsBlock.undo',
    defaultMessage: 'Undo',
  },
  newsDismissed: {
    id: 'NewsBlock.newsDismissed',
    defaultMessage: 'News dismissed',
  },
  newsDismissedCount: {
    id: 'NewsBlock.newsDismissedCount',
    defaultMessage: '{count} news dismissed',
  },
  allCaughtUp: {
    id: 'NewsBlock.allCaughtUp',
    defaultMessage: 'You are all caught up 🎉',
  },
  showNewsAgain: {
    id: 'NewsBlock.showNewsAgain',
    defaultMessage: 'Show news again',
  },
  newsPosition: {
    id: 'NewsBlock.newsPosition',
    defaultMessage: 'News {position} of {total}',
  },
  deckLabel: {
    id: 'NewsBlock.deckLabel',
    defaultMessage:
      'ReportPortal news. Scroll or use arrow keys to browse, swipe a card sideways or press Delete to dismiss it.',
  },
  selectNews: {
    id: 'NewsBlock.selectNews',
    defaultMessage: 'Select news',
  },
});

const getTweetKey = (tweet, index) =>
  tweet.id ?? tweet.created_at ?? tweet.date ?? tweet.createdAt ?? `tweet-${index}`;

// stack geometry, generalized from the previous static layout:
// front card sits below all the back cards, deeper layers peek out on top
const getLayerTop = (layer, maxLayer) => {
  if (layer === 0) {
    return maxLayer * STACK_STEP_PX;
  }
  const depth = maxLayer - Math.min(layer, MAX_VISIBLE_LAYERS);

  return depth * (STACK_STEP_PX - depth * 2);
};

const getNewsElementName = (text = '') => {
  const firstSentence = parseSentences(text)?.[0] || text;
  return stripEmojis(firstSentence).slice(0, NEWS_ELEMENT_NAME_MAX_LENGTH).trim();
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clearInlineTransitions = (nodes) => {
  nodes.forEach((node) => {
    node.style.transition = '';
  });
};

const runStaggerIn = (nodes) => {
  if (prefersReducedMotion()) {
    return;
  }
  nodes.forEach((node) => {
    node.style.transition = 'none';
    node.style.opacity = '0';
    node.style.transform = 'translateY(16px) scale(0.98)';
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nodes.forEach((node, index) => {
        node.style.transition = `opacity 300ms ease ${index * 55}ms, transform 430ms cubic-bezier(0.34, 1.3, 0.64, 1) ${index * 55}ms`;
        node.style.opacity = '';
        node.style.transform = '';
      });
      setTimeout(() => clearInlineTransitions(nodes), 430 + nodes.length * 55);
    });
  });
};

const NewsDeck = ({ tweets = [], onExpandedChange = null }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const visibleTweets = tweets;

  const trackNewsSwitch = useCallback(
    (cardIndex, condition) => {
      const tweet = visibleTweets[cardIndex];
      if (!tweet) {
        return;
      }

      trackEvent(
        LOGIN_PAGE_EVENTS.switchNews({
          iconName: `news_${cardIndex + 1}`,
          elementName: getNewsElementName(tweet.text),
          condition,
        }),
      );
    },
    [trackEvent, visibleTweets],
  );
  const stackSize = Math.min(MAX_TWEETS, visibleTweets.length);

  // order[0] is the index (into visibleTweets) of the front card;
  // the interactive stack always uses at most MAX_TWEETS cards
  const initialOrder = useMemo(
    () => Array.from({ length: stackSize }, (_, index) => index),
    [stackSize],
  );
  const [order, setOrder] = useState(initialOrder);
  const [dismissedStack, setDismissedStack] = useState([]);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [dismissingCard, setDismissingCard] = useState(null); // { index, top }
  const [demotingCard, setDemotingCard] = useState(null);
  const [peekingCard, setPeekingCard] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUndoShown, setIsUndoShown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const deckRef = useRef(null);
  const cardRefs = useRef({});
  const orderRef = useRef(initialOrder);
  const dismissedRef = useRef([]);
  const expandedRef = useRef(false);
  const animatingRef = useRef(false);
  const animatingTimerRef = useRef(null);
  const demotingTimerRef = useRef(null);
  const wheelAccRef = useRef(0);
  const followTimerRef = useRef(null);
  const dragRef = useRef(null); // { startX, startY, axis, dx, dy }
  const peekTimerRef = useRef(null);
  const peekingRef = useRef(false);
  const dismissTimersRef = useRef(new Map());
  const undoTimerRef = useRef(null);
  const promoteTimerRef = useRef(null);
  const lastDragEndRef = useRef(0);
  const pendingCollapseRectsRef = useRef(null);
  const onExpandedChangeRef = useRef(onExpandedChange);

  useEffect(() => {
    onExpandedChangeRef.current = onExpandedChange;
  }, [onExpandedChange]);

  const commitOrder = useCallback((next) => {
    orderRef.current = next;
    setOrder(next);
  }, []);

  const commitDismissed = useCallback((next) => {
    dismissedRef.current = next;
    setDismissedStack(next);
  }, []);

  // clean up every pending timer on unmount
  useEffect(
    () => () => {
      clearTimeout(animatingTimerRef.current);
      clearTimeout(demotingTimerRef.current);
      clearTimeout(followTimerRef.current);
      clearTimeout(peekTimerRef.current);
      clearTimeout(undoTimerRef.current);
      clearTimeout(promoteTimerRef.current);
      dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
      dismissTimersRef.current.clear();
      if (expandedRef.current) {
        onExpandedChangeRef.current?.(false);
      }
    },
    [],
  );

  const getCardNode = useCallback((index) => cardRefs.current[index], []);
  const getFrontNode = useCallback(() => cardRefs.current[orderRef.current[0]], []);

  const measureStack = useCallback(() => {
    const deck = deckRef.current;
    const currentOrder = orderRef.current;
    if (!deck || expandedRef.current || !currentOrder.length) {
      return;
    }
    const front = getCardNode(currentOrder[0]);
    if (!front) {
      return;
    }
    const maxLayer = Math.min(currentOrder.length - 1, MAX_VISIBLE_LAYERS);
    front.style.height = 'auto';
    const frontHeight = front.offsetHeight;
    const deckHeight = getLayerTop(0, maxLayer) + frontHeight;
    // freeze heights so the cards morph smoothly and the back cards
    // never protrude below the front card
    currentOrder.forEach((cardIndex, layer) => {
      const card = getCardNode(cardIndex);
      if (!card) {
        return;
      }
      if (layer === 0) {
        card.style.height = `${frontHeight}px`;
      } else {
        const maxHeight = deckHeight - getLayerTop(Math.min(layer, MAX_VISIBLE_LAYERS), maxLayer);
        card.style.height = `${Math.min(card.scrollHeight, maxHeight)}px`;
      }
    });
    deck.style.height = `${deckHeight}px`;
  }, [getCardNode]);

  useLayoutEffect(() => {
    const deck = deckRef.current;
    if (!deck) {
      return;
    }
    if (isExpanded) {
      deck.style.height = '';
      Object.values(cardRefs.current).forEach((card) => {
        if (card) {
          card.style.height = '';
        }
      });
    } else {
      measureStack();
    }
  }, [order, hiddenCards, isExpanded, measureStack]);

  useEffect(() => {
    const remeasure = () => measureStack();
    let cancelled = false;
    window.addEventListener('resize', remeasure);
    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) {
            remeasure();
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      window.removeEventListener('resize', remeasure);
    };
  }, [measureStack]);

  const cycle = useCallback(
    (direction, condition) => {
      const currentOrder = orderRef.current;
      if (expandedRef.current || animatingRef.current || currentOrder.length < 2) {
        return;
      }
      animatingRef.current = true;
      const movingIndex = direction > 0 ? currentOrder[0] : currentOrder[currentOrder.length - 1];
      const movingNode = getCardNode(movingIndex);
      if (movingNode) {
        movingNode.style.transition = '';
        movingNode.style.transform = '';
      }
      setDemotingCard(movingIndex);
      const next =
        direction > 0
          ? [...currentOrder.slice(1), currentOrder[0]]
          : [currentOrder[currentOrder.length - 1], ...currentOrder.slice(0, -1)];
      commitOrder(next);
      if (condition) {
        trackNewsSwitch(next[0], condition);
      }
      clearTimeout(animatingTimerRef.current);
      animatingTimerRef.current = setTimeout(() => {
        animatingRef.current = false;
      }, CYCLE_DURATION_MS);
      clearTimeout(demotingTimerRef.current);
      demotingTimerRef.current = setTimeout(() => setDemotingCard(null), CYCLE_DURATION_MS);
    },
    [commitOrder, getCardNode, trackNewsSwitch],
  );

  // a function declaration (not useCallback) so the retry can reference itself
  function promote(cardIndex, condition) {
    const currentOrder = orderRef.current;
    if (
      expandedRef.current ||
      currentOrder[0] === cardIndex ||
      !currentOrder.includes(cardIndex)
    ) {
      return;
    }
    if (animatingRef.current) {
      // another animation is in flight — retry instead of dying silently
      clearTimeout(promoteTimerRef.current);
      promoteTimerRef.current = setTimeout(
        () => promote(cardIndex, condition),
        PROMOTE_RETRY_MS,
      );

      return;
    }
    if (condition) {
      trackNewsSwitch(cardIndex, condition);
    }
    const position = currentOrder.indexOf(cardIndex);
    cycle(position <= currentOrder.length / 2 ? 1 : -1);
    if (orderRef.current[0] !== cardIndex) {
      clearTimeout(promoteTimerRef.current);
      promoteTimerRef.current = setTimeout(() => promote(cardIndex), CYCLE_DURATION_MS + 20);
    }
  }

  const showUndo = useCallback(() => {
    setIsUndoShown(true);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setIsUndoShown(false), UNDO_HIDE_MS);
  }, []);

  const hideUndo = useCallback(() => {
    setIsUndoShown(false);
    clearTimeout(undoTimerRef.current);
  }, []);

  const dismiss = useCallback(
    (direction) => {
      const currentOrder = orderRef.current;
      if (
        expandedRef.current ||
        animatingRef.current ||
        dragRef.current ||
        !currentOrder.length
      ) {
        return;
      }
      const cardIndex = currentOrder[0];
      const card = getCardNode(cardIndex);
      const maxLayer = Math.min(currentOrder.length - 1, MAX_VISIBLE_LAYERS);
      animatingRef.current = true;
      if (card) {
        if (prefersReducedMotion()) {
          card.style.opacity = '0';
        } else {
          card.style.transition =
            'transform 340ms cubic-bezier(0.32, 0.72, 0, 1), opacity 280ms ease';
          card.style.transform = `translateX(calc(-50% + ${direction * 560}px)) rotate(${
            direction * 5
          }deg)`;
          card.style.opacity = '0';
        }
      }
      setDismissingCard({ index: cardIndex, top: getLayerTop(0, maxLayer) });
      commitOrder(currentOrder.slice(1));
      commitDismissed([...dismissedRef.current, cardIndex]);
      const timer = setTimeout(
        () => {
          dismissTimersRef.current.delete(cardIndex);
          if (card) {
            card.style.transition = '';
            card.style.transform = '';
            card.style.opacity = '';
          }
          animatingRef.current = false;
          setDismissingCard(null);
          setHiddenCards((prev) => [...prev, cardIndex]);
          showUndo();
        },
        prefersReducedMotion() ? 0 : DISMISS_FLY_OUT_MS,
      );
      dismissTimersRef.current.set(cardIndex, timer);
    },
    [commitOrder, commitDismissed, showUndo, getCardNode],
  );

  const undoDismiss = useCallback(() => {
    const dismissed = dismissedRef.current;
    if (!dismissed.length) {
      return;
    }
    const cardIndex = dismissed[dismissed.length - 1];
    // the card may still be flying out — cancel its pending hide
    const pendingTimer = dismissTimersRef.current.get(cardIndex);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      dismissTimersRef.current.delete(cardIndex);
      animatingRef.current = false;
      setDismissingCard(null);
    }
    const card = getCardNode(cardIndex);
    if (card) {
      card.style.transition = '';
      card.style.transform = '';
      card.style.opacity = '';
    }
    commitDismissed(dismissed.slice(0, -1));
    setHiddenCards((prev) => prev.filter((index) => index !== cardIndex));
    commitOrder([cardIndex, ...orderRef.current]); // returns to the front, like iOS undo
    if (dismissedRef.current.length) {
      showUndo(); // refresh the label and the hide timer
    } else {
      hideUndo();
    }
  }, [commitOrder, commitDismissed, showUndo, hideUndo, getCardNode]);

  const restoreAllNews = useCallback(() => {
    dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
    dismissTimersRef.current.clear();
    animatingRef.current = false;
    Object.values(cardRefs.current).forEach((card) => {
      if (card) {
        card.style.transition = '';
        card.style.transform = '';
        card.style.opacity = '';
      }
    });
    commitDismissed([]);
    setHiddenCards([]);
    setDismissingCard(null);
    commitOrder(Array.from({ length: Math.min(MAX_TWEETS, visibleTweets.length) }, (_, index) => index));
    hideUndo();
  }, [visibleTweets, commitOrder, commitDismissed, hideUndo]);

  const hasNews = visibleTweets.length > 0;
  // keep the deck mounted while the last card is still flying out;
  // if the feed has more than the stack size, dismissing the stack is not "all caught up"
  const isEmptied =
    hasNews &&
    order.length === 0 &&
    dismissedStack.length > 0 &&
    !dismissingCard &&
    visibleTweets.length <= MAX_TWEETS;
  const hasMoreTweets = visibleTweets.length > 1;
  const isStacked = !isExpanded && order.length > 1;
  const maxLayer = Math.min(Math.max(order.length - 1, 0), MAX_VISIBLE_LAYERS);
  const layerByCard = {};
  order.forEach((cardIndex, layer) => {
    layerByCard[cardIndex] = layer;
  });

  // wheel must be a native non-passive listener: React attaches wheel
  // handlers as passive, so preventDefault would be ignored
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) {
      return undefined;
    }
    const handleWheel = (event) => {
      if (expandedRef.current) {
        return; // native scroll in list mode
      }
      if (orderRef.current.length < 2) {
        return;
      }
      event.preventDefault();
      if (animatingRef.current || dragRef.current) {
        return;
      }
      wheelAccRef.current += event.deltaY;
      const front = getFrontNode();
      if (Math.abs(wheelAccRef.current) >= WHEEL_FLIP_THRESHOLD) {
        clearTimeout(followTimerRef.current);
        if (front) {
          front.style.transition = '';
          front.style.transform = '';
        }
        cycle(wheelAccRef.current > 0 ? 1 : -1, NEWS_SWITCH_CARD_SCROLL);
        wheelAccRef.current = 0;

        return;
      }
      // the inactivity reset must run regardless of reduced motion,
      // or stale deltas trigger surprise flips later
      clearTimeout(followTimerRef.current);
      followTimerRef.current = setTimeout(() => {
        if (front) {
          front.style.transition = '';
          front.style.transform = '';
        }
        wheelAccRef.current = 0;
      }, WHEEL_IDLE_RESET_MS);
      if (!prefersReducedMotion() && front) {
        const follow = Math.max(
          -WHEEL_FOLLOW_MAX_PX,
          Math.min(WHEEL_FOLLOW_MAX_PX, wheelAccRef.current * 0.3),
        );
        front.style.transition = 'transform 60ms linear';
        front.style.transform = `translateX(-50%) translateY(${follow}px)`;
      }
    };
    deck.addEventListener('wheel', handleWheel, { passive: false });

    return () => deck.removeEventListener('wheel', handleWheel);
  }, [cycle, getFrontNode, visibleTweets, isEmptied]);

  const cancelPeek = useCallback(() => {
    clearTimeout(peekTimerRef.current);
    peekTimerRef.current = null;
    if (peekingRef.current) {
      peekingRef.current = false;
      setPeekingCard(null);
    }
  }, []);

  const handlePointerDown = (event) => {
    if (expandedRef.current || animatingRef.current) {
      return;
    }
    const front = getFrontNode();
    if (!front?.contains(event.target) || event.target.closest('a')) {
      return;
    }
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
      dx: 0,
      dy: 0,
    };
    setIsDragging(true);
    front.style.transition = 'none';
    deckRef.current?.setPointerCapture(event.pointerId);
    if (!prefersReducedMotion()) {
      peekTimerRef.current = setTimeout(() => {
        if (dragRef.current?.axis) {
          return;
        }
        peekingRef.current = true;
        setPeekingCard(orderRef.current[0]);
        front.style.transition = 'transform 240ms cubic-bezier(0.34, 1.45, 0.64, 1)';
        front.style.transform = 'translateX(-50%) scale(1.03)';
      }, PEEK_DELAY_MS);
    }
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    drag.dx = event.clientX - drag.startX;
    drag.dy = event.clientY - drag.startY;
    const front = getFrontNode();
    if (!front) {
      return;
    }
    if (!drag.axis && Math.hypot(drag.dx, drag.dy) > DRAG_AXIS_LOCK_PX) {
      drag.axis = Math.abs(drag.dx) > Math.abs(drag.dy) ? 'x' : 'y';
      cancelPeek();
      front.style.transition = 'none';
    }
    if (!drag.axis) {
      return;
    }
    if (drag.axis === 'y') {
      const damped = drag.dy * 0.55;
      front.style.transform = `translateX(-50%) translateY(${damped}px) rotate(${
        damped * 0.03
      }deg)`;
    } else {
      // rubber-like horizontal follow with a fade, iOS notification style
      front.style.transform = `translateX(calc(-50% + ${drag.dx}px)) rotate(${drag.dx * 0.02}deg)`;
      front.style.opacity = String(Math.max(0.25, 1 - Math.abs(drag.dx) / 320));
    }
  };

  const resetPointerGesture = () => {
    const drag = dragRef.current;
    const front = getFrontNode();
    cancelPeek();
    dragRef.current = null;
    setIsDragging(false);
    if (drag?.axis) {
      lastDragEndRef.current = performance.now();
    }
    if (front) {
      front.style.transition = '';
      front.style.transform = '';
      front.style.opacity = '';
    }

    return { drag, front };
  };

  const handlePointerCancel = () => {
    if (!dragRef.current) {
      return;
    }
    resetPointerGesture();
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    const wasPeeking = peekingRef.current;
    const { axis, dx, dy } = drag;
    const { front } = resetPointerGesture();
    if (wasPeeking) {
      const link = front?.querySelector('a');
      if (link) {
        window.open(link.href, '_blank', 'noopener');
      }

      return;
    }
    if (axis === 'y' && Math.abs(dy) > DRAG_CYCLE_THRESHOLD_PX) {
      cycle(dy > 0 ? 1 : -1, NEWS_SWITCH_CARD_DRAG_AND_DROP);
    }
    if (axis === 'x' && Math.abs(dx) > DRAG_DISMISS_THRESHOLD_PX) {
      trackEvent(LOGIN_PAGE_EVENTS.SWIPE_NEWS_CARD);
      dismiss(dx > 0 ? 1 : -1);
    }
  };

  const handleDeckClick = (event) => {
    if (expandedRef.current || event.target.closest('a')) {
      return;
    }
    if (performance.now() - lastDragEndRef.current < CLICK_SUPPRESS_AFTER_DRAG_MS) {
      return;
    }
    const cardEntry = Object.entries(cardRefs.current).find(([, node]) =>
      node?.contains(event.target),
    );
    if (!cardEntry) {
      return;
    }
    const cardIndex = Number(cardEntry[0]);
    if (orderRef.current[0] !== cardIndex) {
      promote(cardIndex, NEWS_SWITCH_CARD_CLICK);
    }
  };

  const handleKeyDown = (event) => {
    if (expandedRef.current) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      cycle(1);
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      cycle(-1);
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      dismiss(1);
    }
  };

  // subtle cursor parallax: the deck tilts toward the pointer
  const handleMouseMove = (event) => {
    const deck = deckRef.current;
    if (!deck || expandedRef.current || dragRef.current || prefersReducedMotion()) {
      return;
    }
    const rect = deck.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    deck.style.transform = `perspective(900px) rotateY(${(nx * PARALLAX_MAX_DEG * 1.2).toFixed(
      2,
    )}deg) rotateX(${(-ny * PARALLAX_MAX_DEG).toFixed(2)}deg)`;
  };

  const handleMouseLeave = () => {
    if (deckRef.current) {
      deckRef.current.style.transform = '';
    }
  };

  // FLIP: glide the cards from the expanded list back into the stack
  useLayoutEffect(() => {
    const prevRects = pendingCollapseRectsRef.current;
    pendingCollapseRectsRef.current = null;
    if (!prevRects || isExpanded || prefersReducedMotion()) {
      return;
    }
    measureStack();
    const nodes = [...prevRects.keys()];
    nodes.forEach((node) => {
      const prev = prevRects.get(node);
      const now = node.getBoundingClientRect();
      node.style.transition = 'none';
      node.style.transform = `translateX(-50%) translate(${prev.left - now.left}px, ${
        prev.top - now.top
      }px)`;
    });
    requestAnimationFrame(() => {
      nodes.forEach((node) => {
        node.style.transition = '';
        node.style.transform = '';
      });
    });
  }, [isExpanded, measureStack]);

  const handleToggle = () => {
    if (animatingRef.current) {
      return; // don't reflow mid fly-out/cycle
    }
    const nextExpanded = !isExpanded;
    // handlers and layout effects read the ref synchronously,
    // before React commits the state update
    expandedRef.current = nextExpanded;
    if (nextExpanded) {
      trackEvent(LOGIN_PAGE_EVENTS.CLICK_ON_OPEN_MORE_NEWS);
      setIsExpanded(true);
      requestAnimationFrame(() => {
        // stagger in DOM (chronological) order
        const nodes = visibleTweets
          .map((_, index) => index)
          .filter((index) => !dismissedRef.current.includes(index))
          .map((index) => getCardNode(index))
          .filter(Boolean);
        runStaggerIn(nodes);
      });
    } else {
      const aliveNodes = orderRef.current.map((index) => getCardNode(index)).filter(Boolean);
      pendingCollapseRectsRef.current = new Map(
        aliveNodes.map((node) => [node, node.getBoundingClientRect()]),
      );
      setIsExpanded(false);
    }
    onExpandedChange?.(nextExpanded);
  };

  const postsStack = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      ref={deckRef}
      className={cx('posts-stack', {
        'posts-stack--stacked': isStacked,
        'posts-stack--expanded': isExpanded,
        'posts-stack--dragging': isDragging,
      })}
      aria-roledescription="carousel"
      aria-label={formatMessage(messages.deckLabel)}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={hasNews ? 0 : -1}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleDeckClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {visibleTweets.map((tweet, index) => {
        const layer = layerByCard[index];
        const isInStack = layer !== undefined;
        const isDismissingThis = dismissingCard?.index === index;
        let effectiveLayer = null;
        if (isInStack) {
          effectiveLayer = layer;
        } else if (isDismissingThis) {
          effectiveLayer = 0;
        }
        let style;
        if (hiddenCards.includes(index) || (!isExpanded && index >= MAX_TWEETS)) {
          style = { display: 'none' };
        } else if (isDismissingThis) {
          style = { top: `${dismissingCard.top}px` };
        } else if (!isExpanded && isInStack && order.length > 1) {
          style = { top: `${getLayerTop(Math.min(layer, MAX_VISIBLE_LAYERS), maxLayer)}px` };
        }

        return (
          <PostBlock
            key={getTweetKey(tweet, index)}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            tweetData={tweet}
            stackLayer={effectiveLayer}
            isStacked={isStacked || isDismissingThis}
            isStackFront={effectiveLayer === 0}
            isHidden={isInStack && layer > MAX_VISIBLE_LAYERS}
            isDismissing={isDismissingThis || demotingCard === index}
            isPeeking={peekingCard === index}
            isExpanded={isExpanded}
            style={style}
          />
        );
      })}
    </section>
  );

  return (
    <div className={cx('news-block', { 'news-block--expanded': isExpanded })}>
      {!isEmptied &&
        (order.length > 0 || isExpanded) &&
        (isExpanded ? (
          <ScrollWrapper className={cx('posts-scroll')} hideTracksWhenNotNeeded>
            {postsStack}
          </ScrollWrapper>
        ) : (
          postsStack
        ))}
      {isEmptied && (
        <div className={cx('empty-state')}>
          <span>{formatMessage(messages.allCaughtUp)}</span>
          <button type="button" className={cx('restore-link')} onClick={restoreAllNews}>
            {formatMessage(messages.showNewsAgain)}
          </button>
        </div>
      )}
      <div className={cx('deck-controls')}>
        <div className={cx('undo-pill', { 'undo-pill--shown': isUndoShown })}>
          <span>
            {dismissedStack.length > 1
              ? formatMessage(messages.newsDismissedCount, { count: dismissedStack.length })
              : formatMessage(messages.newsDismissed)}
          </span>
          <button
            type="button"
            className={cx('undo-button')}
            onClick={() => {
              trackEvent(LOGIN_PAGE_EVENTS.CLICK_ON_UNDO);
              undoDismiss();
            }}
            tabIndex={isUndoShown ? 0 : -1}
            aria-hidden={!isUndoShown}
          >
            {formatMessage(messages.undo)}
          </button>
        </div>
        {isStacked && (
          <div className={cx('stack-dots')} aria-label={formatMessage(messages.selectNews)}>
            {visibleTweets.slice(0, MAX_TWEETS).map((tweet, index) =>
              dismissedStack.includes(index) ? null : (
                <button
                  key={getTweetKey(tweet, index)}
                  type="button"
                  className={cx('stack-dot', { 'stack-dot--active': order[0] === index })}
                  aria-label={formatMessage(messages.newsPosition, {
                    position: index + 1,
                    total: Math.min(visibleTweets.length, MAX_TWEETS),
                  })}
                  onClick={() => promote(index, NEWS_SWITCH_DOT_CLICK)}
                />
              ),
            )}
          </div>
        )}
        {hasMoreTweets && !isEmptied && (
          <button type="button" className={cx('toggle-button')} onClick={handleToggle}>
            {isExpanded ? (
              <FormattedMessage id="NewsBlock.close" defaultMessage="Close" />
            ) : (
              <FormattedMessage id="NewsBlock.openMoreNews" defaultMessage="Open more news" />
            )}
          </button>
        )}
      </div>
      <span className={cx('visually-hidden')} aria-live="polite">
        {hasNews && order.length
          ? formatMessage(messages.newsPosition, {
              position: order[0] + 1,
              total: Math.min(visibleTweets.length, MAX_TWEETS),
            })
          : ''}
      </span>
    </div>
  );
};

NewsDeck.propTypes = {
  tweets: PropTypes.array,
  onExpandedChange: PropTypes.func,
};

export const NewsBlock = ({ tweets = [], onExpandedChange = null }) => {
  // remount the deck whenever the feed changes so its state starts fresh
  const deckKey = tweets.map((tweet, index) => getTweetKey(tweet, index)).join('|');

  return <NewsDeck key={deckKey} tweets={tweets} onExpandedChange={onExpandedChange} />;
};

NewsBlock.propTypes = {
  tweets: PropTypes.array,
  onExpandedChange: PropTypes.func,
};

