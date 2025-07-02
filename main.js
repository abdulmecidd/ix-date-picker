import "@siemens/ix/dist/siemens-ix/siemens-ix.css";
import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElement } from "@siemens/ix-icons/loader";
import moment from "moment";

moment.locale("tr");

(async () => {
  defineIxIconCustomElement();
  defineCustomElements();

  const dateFormat = "DD.MM.YYYY";

  function handleDateSelection(dateFrom, dateTo) {
    console.log(dateFrom, dateTo);
  }

  function clearDateSelection(dateFrom, dateTo) {
    dateFrom = null;
    dateTo = null;
    handleDateSelection(dateFrom, dateTo);
    changeUrlParameters(dateFrom, dateTo);
  }

  function changeUrlParameters(dateFrom, dateTo) {
    const params = new URLSearchParams(window.location.search);
    params.set("from", dateFrom);
    params.set("to", dateTo);
    if (!dateFrom && !dateTo) {
      params.set("from", "dd.mm.yyyy");
      params.set("to", "dd.mm.yyyy");
    }
    const newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      params.toString();

    window.history.replaceState({}, "", newUrl);
  }

  customElements.whenDefined("ix-date-dropdown").then(() => {
    const currentDate = moment().format(dateFormat);
    const dateFromStr = new URLSearchParams(window.location.search)?.get(
      "from"
    );
    const dateToStr = new URLSearchParams(window.location.search)?.get("to");
    let dateFrom = moment(dateFromStr, dateFormat);
    let dateTo = moment(dateToStr, dateFormat);

    if (dateFrom.isValid() && (!dateTo || !dateTo.isValid())) {
      dateTo = dateFrom;
      handleDateSelection(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
      changeUrlParameters(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
    } else if ((!dateFrom || !dateFrom.isValid()) && dateTo.isValid()) {
      dateFrom = dateTo;
      handleDateSelection(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
      changeUrlParameters(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
    } else if (dateFrom.isValid() && dateTo.isValid()) {
      if (dateFrom.isAfter(dateTo)) {
        dateTo = dateFrom;
      } else if (dateTo.isBefore(dateFrom)) {
        dateFrom = dateTo;
      }
      handleDateSelection(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
      changeUrlParameters(
        dateFrom.format(dateFormat),
        dateTo.format(dateFormat)
      );
    } else {
      handleDateSelection(null, null);
      changeUrlParameters(null, null);
    }

    const dateDropdown = document.querySelector("ix-date-dropdown");
    dateDropdown.setAttribute("format", "dd.MM.yyyy");
    if (dateFrom.isValid() && dateTo.isValid()) {
      dateDropdown.setAttribute("from", dateFrom.format(dateFormat));
      dateDropdown.setAttribute("to", dateTo.format(dateFormat));
    }
    dateDropdown.setAttribute("max-date", currentDate);

    dateDropdown.addEventListener("dateRangeChange", (event) => {
      const selectedDateFrom = event.detail.from;
      const selectedDateTo = event.detail.to;

      const dateFrom = moment(selectedDateFrom, dateFormat, true);
      const dateTo = selectedDateTo
        ? moment(selectedDateTo, dateFormat, true)
        : dateFrom.clone();

      if (dateFrom.isValid() && dateTo.isValid()) {
        handleDateSelection(
          dateFrom.format(dateFormat),
          dateTo.format(dateFormat)
        );
        changeUrlParameters(
          dateFrom.format(dateFormat),
          dateTo.format(dateFormat)
        );
      }
    });

    const observer = new MutationObserver(() => {
      const buttonParent = dateDropdown.shadowRoot.querySelector(".pull-right");
      if (buttonParent) {
        observer.disconnect();
      }
      const dropdownToggle =
        dateDropdown.shadowRoot.querySelector("ix-dropdown");
      if (dateFrom.isValid() && dateTo.isValid()) {
        dropdownToggle.classList.add("show");
        dropdownToggle.setAttribute("show", "");
      }
      buttonParent?.setAttribute(
        "style",
        "display:flex; flex-direction: row; justify-content: space-between; width: 100%;"
      );

      const doneButton = buttonParent.querySelector("ix-button");
      doneButton.setAttribute("style", "width: auto;");

      const clearButton = document.createElement("ix-button");
      clearButton.setAttribute("icon", "clear-filter");
      clearButton.setAttribute("style", "width: 40%;");
      clearButton.textContent = "Clear";
      clearButton.setAttribute("variant", "primary");
      clearButton.setAttribute("outline", "");
      doneButton.parentNode.insertBefore(clearButton, doneButton);

      if (dateFrom.isValid() && dateTo.isValid()) {
        clearButton.addEventListener("click", () => {
          clearDateSelection(dateFrom, dateTo);
          dateDropdown.setAttribute("from", "");
          dateDropdown.setAttribute("to", "");
          clearButton.setAttribute("disabled", "");
        });
      } else {
        clearButton.setAttribute("disabled", "");
      }
    });

    observer.observe(dateDropdown.shadowRoot, {
      childList: true,
      subtree: true,
    });
  });
})();
