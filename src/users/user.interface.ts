export default interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  address: {
    street: string;
    city: string;
  };
}
