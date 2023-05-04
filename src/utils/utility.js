import emailjs from "@emailjs/browser";
import { createTheme } from "@mui/material/styles";
import { fontFamilies, emailConfig } from "../constants";

export const waitForElm = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const constructTheme = (palette) =>
  createTheme({
    palette,
    typography: {
      fontFamily: fontFamilies.join(","),
    },
  });

export const constructBackgroundStyleText = (backgroundList) =>
  `linear-gradient(180deg, ${backgroundList
    .map((entry) => `${entry.color} ${entry.percent}%`)
    .join(", ")}) fixed ${backgroundList[0].color}`;

export const getEmailLink = ({ displayName, email }) =>
  `mailto:dgude31@outlook.com?subject=Gude%20Foods%20Authirization&body=Hello%2C%0D%0A%0D%0AI%20would%20like%20to%20have%20access%20to%20the%20Gude%20Foods%20website%20functionality%2C%20but%20the%20request%20button%20did%20not%20work.%20My%20name%20is%2C%20${displayName}%2C%20and%20my%20email%20is%2C%20${email}.%0D%0A%0D%0AThhank%20you!`;

export const sendAuthorizationRequest = (user, addAlert) => {
  const { serviceId, templateId, userId } = emailConfig;
  const { displayName, email } = user;
  const userInfo = { displayName, email };

  emailjs.send(serviceId, templateId, userInfo, userId).then(
    (response) => {
      addAlert(
        {
          message: (
            <span>
              Succesfully sent authorization request. You should recieve a
              confirmation email shortly (be sure to check your junk folder).
            </span>
          ),
          alertProps: { severity: "success" },
        },
        5000
      );
    },
    (error) => {
      addAlert(
        {
          message: (
            <span>
              An error occured when sending authorization request. You can reach
              out to&nbsp;
              <a href={getEmailLink(userInfo)}>dgude31@outlook.com</a>
              &nbsp;directly.
            </span>
          ),
          alertProps: { severity: "error" },
        },
        7000
      );
    }
  );
};
