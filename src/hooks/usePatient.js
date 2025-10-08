const usePatient = () => {
  const STORAGE_KEY = "patient";

  const patient = JSON.parse(localStorage.getItem(STORAGE_KEY));

  const setPatient = (patient) => {
    if (!patient || typeof patient !== "object") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patient));
  };

  const clearPatient = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    patient,
    setPatient,
    clearPatient,
  };
};

export default usePatient;
