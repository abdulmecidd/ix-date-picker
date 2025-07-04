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
    let isUpdatingAttribures = false;

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
    if (dateFrom.isValid() && dateTo.isValid() && dateDropdown) {
      dateDropdown.setAttribute("from", dateFrom.format(dateFormat));
      dateDropdown.setAttribute("to", dateTo.format(dateFormat));
    }
    dateDropdown.setAttribute("max-date", currentDate);

    dateDropdown.addEventListener("dateRangeChange", (event) => {
      if (isUpdatingAttribures) return;
      const selectedDateFrom = event.detail.from;
      const selectedDateTo = event.detail.to;

      const dateFrom = moment(selectedDateFrom, dateFormat, true);
      const dateTo = selectedDateTo
        ? moment(selectedDateTo, dateFormat, true)
        : dateFrom.clone();

      if (dateFrom.isValid() && dateTo.isValid()) {
        isUpdatingAttribures = true;
        dateDropdown.setAttribute("from", dateFrom.format(dateFormat));
        dateDropdown.setAttribute("to", dateTo.format(dateFormat));
        handleDateSelection(
          dateFrom.format(dateFormat),
          dateTo.format(dateFormat)
        );
        changeUrlParameters(
          dateFrom.format(dateFormat),
          dateTo.format(dateFormat)
        );
        isUpdatingAttribures = false;
      }
    });

    const observer = new MutationObserver(() => {
      const buttonParent = dateDropdown.shadowRoot.querySelector(".pull-right");

      const datePicker =
        dateDropdown.shadowRoot.querySelector("ix-date-picker");

      const dropdownToggle =
        dateDropdown.shadowRoot.querySelector("ix-dropdown");

      if (buttonParent && datePicker && dropdownToggle) {
        observer.disconnect();
      }

      if (dateFrom.isValid() && dateTo.isValid()) {
        dropdownToggle.classList.add("show");
        dropdownToggle.setAttribute("show", "");
        dropdownToggle.setAttribute(
          "styles",
          "margin: 0px; position: fixed; top: 0px; left: 0px; transform: translate(0px, 32px);"
        );
        const minDate = dateFrom.clone().subtract(7, "days").format(dateFormat);
        const maxDate = moment().isBefore(dateFrom.clone().add(7, "days"))
          ? currentDate
          : dateFrom.clone().add(7, "days").format(dateFormat);
        datePicker.setAttribute("min-date", minDate);
        datePicker.setAttribute("max-date", maxDate);
      } else {
        datePicker.removeAttribute("min-date");
        datePicker.setAttribute("max-date", currentDate);
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
          datePicker.removeAttribute("min-date");
          datePicker.setAttribute("max-date", currentDate);
        });
      }

      datePicker.addEventListener("dateChange", (event) => {
        const { from } = event.detail;
        if (from) {
          const fromDate = moment(from, dateFormat);
          const minDate = fromDate
            .clone()
            .subtract(7, "days")
            .format(dateFormat);

          const maxDate = moment().isBefore(fromDate.clone().add(7, "days"))
            ? currentDate
            : fromDate.clone().add(7, "days").format(dateFormat);
          datePicker.setAttribute("min-date", minDate);
          datePicker.setAttribute("max-date", maxDate);
        }
      });
    });

    observer.observe(dateDropdown.shadowRoot, {
      childList: true,
      subtree: true,
    });
  });
})();
