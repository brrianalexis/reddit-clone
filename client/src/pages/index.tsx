import { withUrqlClient } from 'next-urql';
import { NavBar } from '../components/NavBar';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello, world! 😄</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map(post => <div key={post.id}>{post.title}</div>)
      )}
    </>
  );
};
//?   acá abajo a createUrqlClient se le puede pasar como segundo argumento un objeto con la key 'ssr' que es un booleano, para togglear server-side rendering
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
