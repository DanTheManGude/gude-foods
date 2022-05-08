function GoogleLoginButton(props) {
  const { handleClick } = props;

  return (
    <button
      onClick={handleClick}
      className="googleLoginButton"
      style={{
        backgroundSize: "cover",
        backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_light_normal.png`,
        "&:hover": {
          backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_focus_normal.png`,
        },
        "&:active": {
          backgroundImage: `${process.env.PUBLIC_URL}/media/googleLogin/signin_pressed_normal.png`,
        },
      }}
    />
  );
}

export default GoogleLoginButton;
