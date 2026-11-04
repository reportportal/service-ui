/*
 * Copyright 2026 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import DOMPurify from 'dompurify';
import Parser from 'html-react-parser';
import { SingletonMarkdownObject } from 'components/main/markdown/singletonMarkdownObject';
import styles from './registryMarkdown.scss';

const cx = classNames.bind(styles);

/**
 * Stricter than the app's own user-content sanitiser, which MarkdownViewer uses: that one is for
 * text a colleague wrote in this instance, and keeps `<style>` blocks and `style` attributes so
 * a description can be laid out. A changelog is written by whoever publishes to the registry, and
 * a style block there restyles this whole page.
 *
 * <p>An allow-list, not a deny-list: a deny-list has to know every way markup can reach the
 * network or the page, and does not — `<table background>` is a URI attribute DOMPurify allows by
 * default, so a remote image still loaded through it. What is allowed here is the text markdown
 * produces and nothing that fetches: no images at all (a remote image is fetched by every admin who
 * opens the page, which tells its host who runs which plugin and when; the screenshots block, whose
 * URLs the registry vouches for, is where pictures belong), and the only attributes are a link's
 * address and a title. Links go to http(s) and mail only. `target` and `rel` are not taken from the
 * content; they are set when the markup is turned into elements.
 */
const REGISTRY_CONTENT = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'a',
    'strong',
    'em',
    'b',
    'i',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'del',
    's',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'sup',
    'sub',
    'span',
    'div',
    'details',
    'summary',
  ],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
};

const HEADING = /^h([1-6])$/;

/**
 * The server sends the document as its non-blank lines, stripped (GetMarketplacePluginDetailHandlerImpl
 * strips each line and drops the blank ones), so paragraph breaks and indentation are gone.
 * Joined back with one newline, a line after a list item would be read as part of that item and a
 * plain line after another as the same paragraph; a blank line between each puts every line back
 * in a block of its own, which is what the document showed line by line before.
 */
export const joinChangelogLines = (lines) => (lines || []).join('\n\n');

// What that shape cannot carry, and so renders degraded: fenced code loses its indentation and
// gains blank lines, GFM tables fall apart into paragraphs (a blank line ends a table), nested lists
// flatten, and a setext heading's underline becomes a line of its own. The fix is server-side: send
// the lines unstripped, blank ones included, and join them here with '\n'. GFM task lists render
// without their checkbox, since an input is not allowed — accepted, the item text still reads.

/** The changelog as sanitised HTML: markdown in, only the allow-listed markup out. */
export const registryMarkdownHtml = (lines) =>
  DOMPurify.sanitize(
    SingletonMarkdownObject.getInstance().markdown(joinChangelogLines(lines)),
    REGISTRY_CONTENT,
  ).trim();

/**
 * A plugin changelog from the registry, rendered as the markdown it is written in.
 *
 * <p>Headings are moved down under the heading of the block they sit in: a changelog's `# RC 6.0.0`
 * is the title of its own document, not of this page, and would otherwise outrank it in the outline
 * and in size. Links open in a new tab, with no opener and no referrer handed to the registry's
 * choice of site.
 */
export const RegistryMarkdown = ({ lines, headingLevel, className = '', ...rest }) => {
  const html = registryMarkdownHtml(lines);

  const replace = (node) => {
    if (node.type !== 'tag') {
      return undefined;
    }
    if (node.name === 'a') {
      Object.assign(node.attribs, { target: '_blank', rel: 'noopener noreferrer' });
    }
    const heading = HEADING.exec(node.name);
    if (heading) {
      Object.assign(node, { name: `h${Math.min(6, headingLevel + Number(heading[1]) - 1)}` });
    }

    return undefined;
  };

  return (
    <div className={cx('registry-markdown', className)} {...rest}>
      {Parser(html, { replace })}
    </div>
  );
};

RegistryMarkdown.propTypes = {
  /** The changelog as service-api sends it: its non-blank lines, in order. */
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** The level a top-level `#` becomes: one below the heading of the block it is shown in. */
  headingLevel: PropTypes.oneOf([2, 3, 4, 5, 6]).isRequired,
  className: PropTypes.string,
};
