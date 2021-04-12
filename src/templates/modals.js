export const appointmentsModal = (name, tableFields, auditTrailFields) => {
  const tmplAppointmentsModal = `
    <div class="onsched-popup-shadow" data-animation="zoomInOut">
      <div class="onsched-popup">
          <header class="onsched-popup-header">
              <h1>Booking - ${name}</h1>
              <div class="onsched-close-btn"></div>
          </header>
          <section>
              <table class="onsched-appointment-table">
                  <tbody>
                      ${tableFields.map(field =>
                      `<tr>
                          <th>${field.label}</th>
                          <td>${field.value}</td>
                      </tr>`
                      ).join("")}
                  </tbody>
              </table>
          </section>

          <section>
          ${auditTrailFields.length ? `
              <h3>Audit Trail</h3>
              <table class="onsched-appointment-table">
                  <tbody>
                      <tr>
                          <th>User</th>
                          <th>Modified on</th>
                          <th>Modification</th>
                      </tr>
                      ${auditTrailFields.map(field =>
                          `<tr>
                              <td>${field.modifiedBy}</td>
                              <td>${field.modifiedOn}</td>
                              <td>${field.modificationType}</td>
                          </tr>`
                      ).join("")}
                  </tbody>
              </table>
          ` : ''}
          </section>
          <footer class="onsched-popup-footer">
              <a data-appointment-action="cancel">Cancel</a>
              <a data-appointment-action="confirm">Confirm</a>
          </footer>

      </div>
    </div>
  `;
  return tmplAppointmentsModal;
}
