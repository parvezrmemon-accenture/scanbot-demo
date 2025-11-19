export const LICENSE_KEY =
  "mFFDj+H8VMT4ejRO23w52To5E8beL9" +
  "fNASJBVkZ4LdyiPwTb2sANEoU9AhVv" +
  "0YqjjA/54f2oS8F/4odKQlZ5q/fBy0" +
  "0bMoXp2wY4kaxaccqjf0SFupecSFaF" +
  "TkxrAu489zKvg9kFLmYqnZMohFOqEU" +
  "NUKjOCC34rUa1nyyklOnvJIWwp7Vm3" +
  "M/SG1liQ6NbaD9lEGi4QGNOQ2npVrU" +
  "tvrO60604vXm7Gq2rEYAlqOBFHdRWt" +
  "n/XoUUmS1E4+5BdxBP3N6SFd444Ki5" +
  "2mkcSr1SFeyF2FNDo1zcMFkTdiHdPd" +
  "atLZrF9lDBR3D3nTbG/1PUsE+21USe" +
  "KhM/NvhPRuCw==\nU2NhbmJvdFNESw" +
  "psb2NhbGhvc3R8cGFydmV6cm1lbW9u" +
  "LWFjY2VudHVyZS5naXRodWIuaW8KMT" +
  "c2NDAyODc5OQo4Mzg4NjA3Cjg=\n";

export const scanbotConfig = {
  licenseKey: LICENSE_KEY,
  engine: process.env.PUBLIC_URL + "/wasm",
};

export const SCANDIT_API =
  "AlNGAD4cGY6BOVF3v8yuYMUgFeG0K0RA0j0S66YRRnPiOQQJ/Ef4bn18TX+KZS6HsT0JwRxUi+IHaSVDP33mCcRCvMuQZRZeNwLFYj8mfWcTG0NghBV0fHAasbYOUXwubnPM4Q9a42peSMe9XVyKHyFZsXOdWtiZBkSJnTkVCzpfdNk1NnUAYw5WdcNzUROGyg9/Rzxs1dYkQU5v034qgZ1V/JKga3ORLHP1CSEX04K5VnN96BXhQJZF3EEVXJ4rYUxD9ZNE29vwYtskD2XokIV+GssZf2GIwRcrj5JqnK3pWXrxgW94/IpiUbzrc8QHOCVJtNJHtIRNCg1j1322UkNSA8q+WQp1dUQ6N6tQi29tXp0EoGd6aXZcxJU/dMGtnXV2xGkcThLteV0GPUfKKB1nI/q4SJ7wK0Q6TaMeo/ASZ2h8yW1SsthU9SlRbH5ggWTEclNKIOgwST8ERAiGKJEpGWQ2dUmDbD9lzroFvajKR550VFGr1DY9nw6AfY268F66xc4yBO43EYMbqi/XE7MKY48CJ/ZI8tu4ee6lDne5qweUi1DsLPIaU0EBBDJu6XLKvDU+UPVd2xOemsnf47Wem9qqAGLNj92ICm5Ey5+StPTki7XTzM6uWC6oBH0EHKSK8tL0iePlCbw0OZ18/X2o+y3WKVhaW75TdXrSiDwkcYspl95puqFuipUkxZL/haF7a99lYPffjguriUCYsl9b59SAgCsDwYl6a+vgtmRuyG+g4ZOTHssee1MmjnDYNpjon1ONqCoi8gE8v6guY9aAllPUdEowJmGS8Q881R0wo4FEEw+/UmKtBp1OGiEIdXFuEhQWHBufr2gaOhZoDcdfTx4wVfKEj/OFRHC29DaAfiIwppVRCH1KMG3uYgKpt8YJmJdWPtzTiwQSpRTzm8/VvhzLx8v69GFBDuCuUw9RZjrdXTnkSdPkVV+zGDLQA6IOsdYTPrABiScTYRPe8nXGKGZKNLzcfA7rv8ZpI6T3/yoX5kgNfF85QXLwV564/xSftu5v13EPN3/x6aHzPKKqcE/SPbtSdkuxHeJh948VOQ+zHciU6u71T+972LrN2lQnqRBIiWuP9sJygxqJ/mpModJFqbvcVVW6SI5qKGtz8Ye9wEkiHgF1ynlxVRxakhce4xVSbZcUC0RkxQGUP/1Rw/EEvS0+MVDN57BCCkhzwzyVVMrlUc6Jne4Fh1Uy89Y=";

export const cornerSVG = (
  <svg width="40" height="40">
    <path
      d="M 10 0 L 0 0 L 0 10"
      stroke="white"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const cornerStyles = {
  topLeft: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
    transform: "rotate(90deg)",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    transform: "rotate(-90deg)",
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    transform: "rotate(180deg)",
  },
};
