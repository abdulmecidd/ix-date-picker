import "@siemens/ix/dist/siemens-ix/siemens-ix.css";
import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElement } from "@siemens/ix-icons/loader";

(async () => {
  defineIxIconCustomElement();
  defineCustomElements();
})();
