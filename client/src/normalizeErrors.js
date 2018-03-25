const normalizeErrors = errors => {
  const err = errors.reduce((acc, cv) => {
    if (cv.path in acc) {
      acc[cv.path].push(cv.message);
    } else {
      acc[cv.path] = [cv.message];
    }

    return acc;
  }, {});

  return err;
};

export default normalizeErrors;
