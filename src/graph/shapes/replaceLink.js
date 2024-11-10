function replaceAttr(token, env) {
  token.attrs.push([
    "onclick",
    "window.dispatchEvent(new CustomEvent('open_link', {detail: {event: event}}))",
  ]);
}

const replace = (md, opts) => {
  md.core.ruler.after("inline", "replace-link", function (state) {
    state.tokens.forEach(function (blockToken) {
      if (blockToken.type === "inline" && blockToken.children) {
        blockToken.children.forEach(function (token) {
          const type = token.type;
          if (type === "link_open") {
            replaceAttr(token, state.env);
          }
        });
      }
    });
    return false;
  });
};

export default replace;
