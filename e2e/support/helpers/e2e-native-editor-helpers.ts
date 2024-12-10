function nativeEditor() {
  cy.findAllByTestId("loading-indicator").should("not.exist");
  return cy.get("[data-testid=native-query-editor] .cm-content");
}

function focusNativeEditor() {
  nativeEditor().should("be.visible").click();

  nativeEditor().get(".cm-editor").should("have.class", "cm-focused");

  return nativeEditor();
}

function blurNativeEditor() {
  nativeEditor().get(".cm-editor").blur();
}

function nativeEditorCompletions() {
  return cy.get(".cm-tooltip-autocomplete").should("be.visible");
}

function nativeEditorCompletion(label: string) {
  return cy.get(".cm-completionLabel").contains(label).parent();
}

function nativeEditorSelectAll() {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const metaKey = isMac ? "Meta" : "Control";
  focusNativeEditor().realPress([metaKey, "A"]);
  cy.get(".cm-selectionBackground").should("exist");
}

function clearNativeEditor() {
  nativeEditorSelectAll();
  cy.realPress(["Backspace"]);
}

export function nativeEditorType(
  text: string,
  { delay = 10 }: { delay?: number } = {},
) {
  focusNativeEditor();

  const parts = text.replaceAll("{{", "{{}{{}").split(/(\{[^}]+\})/);

  function type(text: string) {
    cy.realType(text, {
      pressDelay: delay,
    });
  }

  // HACK: realType does not accept a lot of common escape sequences,
  // so we implement them manually here for the nateive editor.
  parts.forEach(part => {
    switch (part.toLowerCase()) {
      case "":
        return;

      case "{clear}":
        return clearNativeEditor();

      case "{selectAll}":
        return nativeEditorSelectAll();

      case "{leftarrow}":
        return cy.realPress(["ArrowLeft"]);

      case "{rightarrow}":
        return cy.realPress(["ArrowRight"]);

      case "{enter}":
        return cy.realPress(["Enter"]);

      case "{home}":
      case "{movetostart}":
        return cy.realPress(["Control", "A"]);

      case "{end}":
      case "{movetoend}":
        return cy.realPress(["Control", "E"]);

      case "{{}":
        return cy.realType("{");
    }

    if (part.startsWith("{") && part.endsWith("}")) {
      // unknown escape sequence, let's try typing it
      type("{");
      type(part.slice(1));
      return;
    }

    type(part);
  });

  return nativeEditor();
}

export const NativeEditor = {
  get: nativeEditor,
  type(text: string) {
    nativeEditorType(text);
    return NativeEditor;
  },
  focus() {
    focusNativeEditor();
    return NativeEditor;
  },
  blur() {
    blurNativeEditor();
    return NativeEditor;
  },
  selectAll() {
    nativeEditorSelectAll();
    return NativeEditor;
  },
  clear() {
    clearNativeEditor();
    return NativeEditor;
  },
  completions: nativeEditorCompletions,
  completion: nativeEditorCompletion,
};
