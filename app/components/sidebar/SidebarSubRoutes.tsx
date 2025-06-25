import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router';
import styles from './sidebar.module.css';

interface SidebarSubRoutesProps extends PropsWithChildren {
  routes: array;    // children routes
  isShown: boolean; // whether this should render
}

export default function SidebarSubRoutes(props: SidebarSubRoutesProps) {
  if (props.isShown) {
    return (
      <ul className={styles.sidebarSubRoutes}>
        {props.routes.map((item, i) =>
          <li key={i.toString()}>
            <NavLink to={item.path} className={styles.sidebarSubRouteLink}>
              {item.title}
            </NavLink>
          </li>
        )}
      </ul>
    );
  }
}
